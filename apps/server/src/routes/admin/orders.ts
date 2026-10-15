import { Router, Request, Response } from "express";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";
import { sendOrderStatusUpdateEmail } from "../../lib/email";
import { getPaginationParams, buildPaginationMeta } from "../../lib/pagination";

const router = Router();
const VALID_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

// Reusable handler for getting orders list
const getOrdersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query as Record<string, string>;
    const pagination = getPaginationParams(req);

    const conditions = [
      status && status !== "all" ? eq(ordersTable.status, status) : undefined,
      search
        ? or(
            ilike(ordersTable.customerName, `%${search}%`),
            ilike(ordersTable.customerEmail, `%${search}%`),
            ilike(sql`${ordersTable.id}::text`, `%${search}%`)
          )
        : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [orders, [{ total }]] = await Promise.all([
      db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt))
        .limit(pagination.limit).offset(pagination.offset),
      db.select({ total: count() }).from(ordersTable).where(where),
    ]);

    res.json({ orders, ...buildPaginationMeta(pagination, total) });
  } catch (err) {
    console.error("[admin/orders]", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reusable handler for getting a single order with items
const getSingleOrderHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid order ID" }); return; }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    res.json({ order, items });
  } catch (err) {
    console.error("[admin/orders/:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reusable handler for updating order status or assignment via PUT
const updateOrderHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid order ID" }); return; }

    const { status, assignedToId } = req.body as { status?: string; assignedToId?: number | null };
    
    const patch: Record<string, any> = { updatedAt: new Date() };

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
        return;
      }
      patch["status"] = status;
    }

    if (assignedToId !== undefined) {
      patch["assignedToId"] = assignedToId ? Number(assignedToId) : null;
    }

    const updated = await db
      .update(ordersTable)
      .set(patch)
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated.length) { res.status(404).json({ error: "Order not found" }); return; }

    if (status !== undefined) {
      // Fire-and-forget: a failed email should never fail the status update itself.
      void sendOrderStatusUpdateEmail(updated[0]);
    }

    res.json({ order: updated[0] });
  } catch (err) {
    console.error("[admin/orders PUT]", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reusable handler for assignment PATCH route
const assignOrderHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid order ID" }); return; }

    const { assignedToId } = req.body as { assignedToId?: number | null };

    const updated = await db
      .update(ordersTable)
      .set({ 
        assignedToId: assignedToId !== undefined && assignedToId !== null ? Number(assignedToId) : null,
        updatedAt: new Date()
      })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated.length) { 
      res.status(404).json({ error: "Order not found" }); 
      return; 
    }

    res.json({ order: updated[0] });
  } catch (err) {
    console.error("[admin/orders PATCH assign]", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// NEW: Handler for deleting an order (and associated order items via database constraints or explicit delete)
const deleteOrderHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { 
      res.status(400).json({ error: "Invalid order ID" }); 
      return; 
    }

    // Optional: First delete related order items if your database lacks ON DELETE CASCADE
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));

    const deleted = await db
      .delete(ordersTable)
      .where(eq(ordersTable.id, id))
      .returning();

    if (!deleted.length) { 
      res.status(404).json({ error: "Order not found" }); 
      return; 
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("[admin/orders DELETE]", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Map routes (supporting both /orders and any alternate prefix if needed)
router.get("/orders", requireAdmin, getOrdersHandler);
router.get("/orders/:id", requireAdmin, getSingleOrderHandler);

router.put("/orders/:id", requireAdmin, updateOrderHandler);
router.put("/orders/:id/status", requireAdmin, updateOrderHandler);

router.patch("/orders/:id/assign", requireAdmin, assignOrderHandler);

// NEW: Register delete route
router.delete("/orders/:id", requireAdmin, deleteOrderHandler);

export default router;