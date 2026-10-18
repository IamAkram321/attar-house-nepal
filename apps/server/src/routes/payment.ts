import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "crypto";

const router: IRouter = Router();

const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_URL = process.env.ESEWA_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

/**
 * POST /api/payment/esewa/initiate
 * Initiates eSewa v2 payment or provides mock redirect info.
 */
router.post("/payment/esewa/initiate", (req: Request, res: Response): void => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      res.status(400).json({ error: "orderId and amount are required" });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

    // MOCK MODE: Return mock redirect URL and explicit isMock flag
    if (process.env.ENABLE_MOCK_PAYMENT === "true") {
      res.json({
        isMock: true,
        redirectUrl: `${frontendUrl}/payment/success?gateway=esewa&orderId=${orderId}&mock=true`,
      });
      return;
    }

    const totalAmount = Number(amount).toFixed(2);
    const transactionUuid = `ORDER-${orderId}-${Date.now()}`;
    const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_MERCHANT_CODE}`;

    const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
    const signature = hmac.update(signatureString).digest("base64");

    res.json({
      isMock: false,
      esewaUrl: ESEWA_URL,
      formData: {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: ESEWA_MERCHANT_CODE,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${backendUrl}/api/payment/esewa/callback?orderId=${orderId}`,
        failure_url: `${frontendUrl}/payment/failed?orderId=${orderId}`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      },
    });
  } catch (err) {
    console.error("[payment/esewa/initiate]", err);
    res.status(500).json({ error: "Failed to initiate eSewa payment" });
  }
});

/**
 * ALL /api/payment/esewa/callback
 * Handles eSewa completion callback (GET or POST) on Express backend and issues HTTP 302 GET redirect to Vite frontend.
 */
router.all("/payment/esewa/callback", (req: Request, res: Response): void => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const orderId = req.query.orderId || "";
  const data = req.query.data || req.body?.data || "";

  const redirectUrl = new URL(`${frontendUrl}/payment/success`);
  redirectUrl.searchParams.set("gateway", "esewa");
  if (orderId) redirectUrl.searchParams.set("orderId", String(orderId));
  if (data) redirectUrl.searchParams.set("data", String(data));

  res.redirect(redirectUrl.toString());
});

/**
 * POST /api/payment/esewa/verify
 * Decodes and verifies Base64 payment response from eSewa v2.
 */
router.post("/payment/esewa/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { encodedData } = req.body;

    if (!encodedData) {
      res.status(400).json({ error: "Encoded data string is required" });
      return;
    }

    const decodedJson = Buffer.from(encodedData, "base64").toString("utf-8");
    const parsedData = JSON.parse(decodedJson);

    const { status, total_amount, transaction_uuid, signature, signed_field_names } = parsedData;

    if (status !== "COMPLETE") {
      res.status(400).json({ error: "Payment was not completed successfully", status });
      return;
    }

    const fields = signed_field_names.split(",");
    const messageParts = fields.map((field: string) => `${field}=${parsedData[field]}`);
    const messageString = messageParts.join(",");

    const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
    const expectedSignature = hmac.update(messageString).digest("base64");

    if (signature !== expectedSignature) {
      res.status(400).json({ error: "Invalid signature verification failed" });
      return;
    }

    res.json({ success: true, transactionUuid: transaction_uuid, amount: total_amount });
  } catch (err) {
    console.error("[payment/esewa/verify]", err);
    res.status(500).json({ error: "eSewa verification failed" });
  }
});

/**
 * POST /api/payment/khalti/initiate
 */
router.post("/payment/khalti/initiate", async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;

    if (!orderId || !amount) {
      res.status(400).json({ error: "orderId and amount are required" });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (!KHALTI_SECRET_KEY) {
      res.json({
        pidx: `mock_pidx_${Date.now()}`,
        paymentUrl: `${frontendUrl}/payment/success?gateway=khalti&orderId=${orderId}&mock=true`,
      });
      return;
    }

    const amountInPaisa = Math.round(Number(amount) * 100);

    const payload = {
      return_url: `${frontendUrl}/payment/success?gateway=khalti&orderId=${orderId}`,
      website_url: frontendUrl,
      amount: amountInPaisa,
      purchase_order_id: String(orderId),
      purchase_order_name: `Order #${orderId}`,
      customer_info: {
        name: customerName || "Customer",
        email: customerEmail || "customer@example.com",
        phone: customerPhone || "9800000000",
      },
    };

    const khaltiRes = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
      method: "POST",
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await khaltiRes.json()) as Record<string, any>;

    if (!khaltiRes.ok) {
      res.status(400).json({ error: data.detail || "Khalti initiation failed" });
      return;
    }

    res.json({ pidx: data.pidx, paymentUrl: data.payment_url });
  } catch (err) {
    console.error("[payment/khalti/initiate]", err);
    res.status(500).json({ error: "Failed to initiate Khalti payment" });
  }
});

/**
 * POST /api/payment/khalti/verify
 */
router.post("/payment/khalti/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      res.status(400).json({ error: "pidx is required" });
      return;
    }

    if (!KHALTI_SECRET_KEY || pidx.startsWith("mock_pidx_")) {
      res.json({ success: true, mock: true });
      return;
    }

    const khaltiRes = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
      method: "POST",
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    const data = (await khaltiRes.json()) as Record<string, any>;

    if (!khaltiRes.ok || data.status !== "Completed") {
      res.status(400).json({ error: data.detail || "Payment verification failed", status: data.status });
      return;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("[payment/khalti/verify]", err);
    res.status(500).json({ error: "Failed to verify Khalti payment" });
  }
});

/**
 * POST /api/payment/qr/generate
 */
router.post("/payment/qr/generate", (req: Request, res: Response): void => {
  try {
    const { orderId, amount } = req.body;

    res.json({
      orderId,
      amount,
      qrImageUrl:
        "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" +
        encodeURIComponent(`PAYMENT:Order#${orderId}-NPR${amount}`),
      accountName: "ATTAR HOUSE NEPAL",
      instructions: "Scan using any Mobile Banking App, Fonepay, eSewa, or Khalti to settle consignment.",
    });
  } catch (err) {
    console.error("[payment/qr/generate]", err);
    res.status(500).json({ error: "Failed to generate payment QR" });
  }
});

export default router;