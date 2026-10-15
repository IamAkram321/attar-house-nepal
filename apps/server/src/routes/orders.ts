import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, cartItemsTable, ordersTable, orderItemsTable } from "@workspace/db";
import { sendOrderConfirmationEmail } from "../lib/email";
import { requireAuth } from "../middleware/requireAuth";
import { createCloudinaryUploader } from "../lib/cloudinary";

// Configure Cloudinary upload engine specifically for payment proofs
const uploadProof = createCloudinaryUploader(
  process.env.PAYMENT_PROOF_FOLDER || "ayesha-fragrances/payment-proofs"
);

const CART_SESSION_COOKIE = "cart_session_id";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateOrderBody(body: unknown): { error: string } | {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  notes?: string;
  paymentMethod: string;
  transactionId?: string;
} {
  const b = (body ?? {}) as Record<string, unknown>;

  const customerName = typeof b.customerName === "string" ? b.customerName.trim() : "";
  if (!customerName) return { error: "Name is required" };

  const customerEmail = typeof b.customerEmail === "string" ? b.customerEmail.trim() : "";
  if (!customerEmail || !EMAIL_RE.test(customerEmail)) return { error: "A valid email is required" };

  const shippingAddress = typeof b.shippingAddress === "string" ? b.shippingAddress.trim() : "";
  if (!shippingAddress) return { error: "Shipping address is required" };

  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : undefined;
  const notes = typeof b.notes === "string" ? b.notes.trim() : undefined;
  const paymentMethod = typeof b.paymentMethod === "string" ? b.paymentMethod.trim() : "cash_on_delivery";
  const transactionId = typeof b.transactionId === "string" ? b.transactionId.trim() : undefined;

  return { customerName, customerEmail, customerPhone, shippingAddress, notes, paymentMethod, transactionId };
}

const router: IRouter = Router();

/** POST /api/orders — process both JSON and FormData requests */
router.post("/orders", (req: Request, res: Response): void => {
  const handler = uploadProof.single("paymentProof");

  handler(req, res, async (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Proof upload failed";
      res.status(400).json({ error: message });
      return;
    }

    try {
      const sessionId = (req.cookies?.[CART_SESSION_COOKIE] as string | undefined) ?? "";

      if (!sessionId) {
        res.status(400).json({ error: "Your cart is empty" });
        return;
      }

      // req.body is now populated correctly by multer for FormData requests
      const validated = validateOrderBody(req.body);
      if ("error" in validated) {
        res.status(400).json({ error: validated.error });
        return;
      }

      const { 
        customerName, 
        customerEmail, 
        customerPhone, 
        shippingAddress, 
        notes, 
        paymentMethod, 
        transactionId 
      } = validated;

      // multer-storage-cloudinary populates req.file.path with the secure HTTPS Cloudinary URL
      const paymentProofUrl = req.file ? req.file.path : null;

      if (paymentMethod === "qr" && (!transactionId || !req.file)) {
        res.status(400).json({ error: "Transaction ID and payment screenshot are required for QR payments." });
        return;
      }

      const items = await db
        .select()
        .from(cartItemsTable)
        .where(eq(cartItemsTable.sessionId, sessionId));

      if (items.length === 0) {
        res.status(400).json({ error: "Your cart is empty" });
        return;
      }

      const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
      const userId = req.session?.userId ?? null;

      const [order] = await db
        .insert(ordersTable)
        .values({
          userId,
          customerName,
          customerEmail,
          customerPhone: customerPhone ?? null,
          shippingAddress,
          paymentMethod,
          paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "awaiting_verification",
          status: "pending",
          total: String(total.toFixed(2)),
          notes: notes ?? null,
          transactionId: transactionId ?? null,
          paymentProof: paymentProofUrl ?? null,
        })
        .returning();

      const insertedItems = await db
        .insert(orderItemsTable)
        .values(
          items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            price: String(item.price),
            color: item.color ?? null,
            material: item.material ?? null,
          }))
        )
        .returning();

      await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

      void sendOrderConfirmationEmail(order, insertedItems);

      res.status(201).json({ id: order.id, total, status: order.status });
    } catch (dbErr) {
      console.error("[orders]", dbErr);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

/** GET /api/orders/mine — order history for the logged-in user */
router.get("/orders/mine", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, req.session.userId!))
      .orderBy(desc(ordersTable.createdAt));

    res.json({ orders });
  } catch (err) {
    console.error("[orders/mine]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** GET /api/orders/mine/:id — a single order, scoped to the logged-in user */
router.get("/orders/mine/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid order ID" }); return; }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, req.session.userId!)))
      .limit(1);

    if (!order) { res.status(404).json({ error: "Order not found" }); return; }

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    res.json({ order, items });
  } catch (err) {
    console.error("[orders/mine/:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;