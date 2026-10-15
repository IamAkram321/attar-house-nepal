import { Router, Request, Response } from "express";
import { db, reviewsTable, productsTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";
import { getPaginationParams, buildPaginationMeta } from "../../lib/pagination";

const router = Router();

async function recomputeProductRating(productId: number): Promise<void> {
  const [agg] = await db
    .select({
      avgRating: sql<string>`coalesce(avg(${reviewsTable.rating}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, productId));

  await db
    .update(productsTable)
    .set({
      rating: Number(agg?.avgRating ?? 0).toFixed(2),
      reviewCount: Number(agg?.count ?? 0),
    })
    .where(eq(productsTable.id, productId));
}

/** GET /api/admin/reviews — every review, with its product name, newest first */
router.get("/reviews", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const pagination = getPaginationParams(req);

    const [reviews, [{ total }]] = await Promise.all([
      db
        .select({
          id: reviewsTable.id,
          productId: reviewsTable.productId,
          productName: productsTable.name,
          customerName: reviewsTable.customerName,
          rating: reviewsTable.rating,
          title: reviewsTable.title,
          comment: reviewsTable.comment,
          verifiedPurchase: reviewsTable.verifiedPurchase,
          createdAt: reviewsTable.createdAt,
        })
        .from(reviewsTable)
        .leftJoin(productsTable, eq(reviewsTable.productId, productsTable.id))
        .orderBy(desc(reviewsTable.createdAt))
        .limit(pagination.limit)
        .offset(pagination.offset),
      db.select({ total: count() }).from(reviewsTable),
    ]);

    res.json({ reviews, ...buildPaginationMeta(pagination, total) });
  } catch (err) {
    console.error("[admin/reviews GET]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /api/admin/reviews/:id — moderation: remove an inappropriate review */
router.delete("/reviews/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid review ID" }); return; }

    const deleted = await db.delete(reviewsTable).where(eq(reviewsTable.id, id)).returning();
    if (!deleted.length) { res.status(404).json({ error: "Review not found" }); return; }

    await recomputeProductRating(deleted[0].productId);

    res.json({ success: true, review: deleted[0] });
  } catch (err) {
    console.error("[admin/reviews DELETE]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;