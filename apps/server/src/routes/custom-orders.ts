import { Router, type IRouter } from "express";
import { db, customOrdersTable } from "@workspace/db";
import { CreateCustomOrderBody, CreateCustomOrderResponse } from "@workspace/api-zod";
import { customOrderLimiter } from "../middleware/publicLimiter";

const router: IRouter = Router();

router.post("/custom-orders", customOrderLimiter, async (req, res): Promise<void> => {
  const parsed = CreateCustomOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  const [order] = await db
    .insert(customOrdersTable)
    .values({
      projectName: data.projectName,
      description: data.description,
      intendedUse: data.intendedUse ?? null,
      lengthMm: data.lengthMm != null ? String(data.lengthMm) : null,
      widthMm: data.widthMm != null ? String(data.widthMm) : null,
      heightMm: data.heightMm != null ? String(data.heightMm) : null,
      dimensionUnit: data.dimensionUnit,
      quantity: data.quantity,
      preferredMaterial: data.preferredMaterial,
      preferredColor: data.preferredColor ?? null,
      desiredFinish: data.desiredFinish,
      budgetRange: data.budgetRange ?? null,
      desiredDeliveryDate: data.desiredDeliveryDate ?? null,
      additionalNotes: data.additionalNotes ?? null,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone ?? null,
      preferredContact: data.preferredContact,
      fileUrls: data.fileUrls ?? [],
      status: "pending",
    })
    .returning();

  res.status(201).json(
    CreateCustomOrderResponse.parse({
      id: order.id,
      projectName: order.projectName,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }),
  );
});

export default router;