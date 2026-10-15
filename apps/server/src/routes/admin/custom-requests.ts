import { Router, Request, Response } from "express";
import { db, customOrdersTable } from "@workspace/db";
import { eq, desc, and, or, ilike, count } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";
import { getPaginationParams, buildPaginationMeta } from "../../lib/pagination";

const router = Router();
const VALID_STATUSES = ["pending", "under_review", "quotation_sent", "approved", "in_production", "completed", "cancelled"];

const getRequestsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query as Record<string, string>;
    const pagination = getPaginationParams(req);

    const conditions = [
      status && status !== "all" ? eq(customOrdersTable.status, status) : undefined,
      search
        ? or(
            ilike(customOrdersTable.fullName, `%${search}%`),
            ilike(customOrdersTable.email, `%${search}%`),
            ilike(customOrdersTable.projectName, `%${search}%`)
          )
        : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [requests, [{ total }]] = await Promise.all([
      db.select().from(customOrdersTable).where(where).orderBy(desc(customOrdersTable.createdAt))
        .limit(pagination.limit).offset(pagination.offset),
      db.select({ total: count() }).from(customOrdersTable).where(where),
    ]);

    res.json({ requests, ...buildPaginationMeta(pagination, total) });
  } catch (err) {
    console.error("[admin/custom-orders]", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSingleRequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [request] = await db.select().from(customOrdersTable).where(eq(customOrdersTable.id, id)).limit(1);
    if (!request) { res.status(404).json({ error: "Request not found" }); return; }
    res.json({ request });
  } catch (err) {
    console.error("[admin/custom-orders/:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateRequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const { status, internalNotes, quotationPrice, assignedToId } = req.body as {
      status?: string;
      internalNotes?: string;
      quotationPrice?: string;
      assignedToId?: number | null;
    };

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: "Invalid status" }); return;
    }

    const patch: Record<string, any> = {};
    if (status !== undefined) patch["status"] = status;
    if (internalNotes !== undefined) patch["internalNotes"] = internalNotes;
    if (quotationPrice !== undefined) patch["quotationPrice"] = quotationPrice;
    if (assignedToId !== undefined) patch["assignedToId"] = assignedToId ? Number(assignedToId) : null;

    if (!Object.keys(patch).length) { res.status(400).json({ error: "No fields to update" }); return; }

    const updated = await db.update(customOrdersTable).set(patch).where(eq(customOrdersTable.id, id)).returning();
    if (!updated.length) { res.status(404).json({ error: "Request not found" }); return; }
    res.json({ request: updated[0] });
  } catch (err) {
    console.error("[admin/custom-orders PUT]", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const assignRequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const { assignedToId } = req.body as { assignedToId?: number | null };

    const updated = await db
      .update(customOrdersTable)
      .set({ 
        assignedToId: assignedToId !== undefined && assignedToId !== null ? Number(assignedToId) : null 
      })
      .where(eq(customOrdersTable.id, id))
      .returning();

    if (!updated.length) { 
      res.status(404).json({ error: "Request not found" }); 
      return; 
    }

    res.json({ request: updated[0] });
  } catch (err) {
    console.error("[admin/custom-orders PATCH assign]", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Map both variations so neither frontend route causes a 404
['/custom-orders', '/custom-requests'].forEach((path) => {
  router.get(path, requireAdmin, getRequestsHandler);
  router.get(`${path}/:id`, requireAdmin, getSingleRequestHandler);
  router.put(`${path}/:id`, requireAdmin, updateRequestHandler);
  router.patch(`${path}/:id/assign`, requireAdmin, assignRequestHandler);
});

export default router;