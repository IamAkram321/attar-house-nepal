import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, ne, desc, sql } from "drizzle-orm";
import { db, reviewsTable, ordersTable, orderItemsTable, productsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

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

/** GET /api/products/:productId/reviews — public, no auth required to read */
router.get("/products/:productId/reviews", async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(String(req.params.productId));
    if (isNaN(productId)) { res.status(400).json({ error: "Invalid product ID" }); return; }

    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, productId))
      .orderBy(desc(reviewsTable.createdAt));

    res.json({ reviews });
  } catch (err) {
    console.error("[reviews GET]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /api/products/:productId/reviews — requires login. One review per user per product (edits overwrite). */
router.post("/products/:productId/reviews", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(String(req.params.productId));
    if (isNaN(productId)) { res.status(400).json({ error: "Invalid product ID" }); return; }

    const body = req.body as Record<string, unknown>;
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : null;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be a whole number from 1 to 5" });
      return;
    }
    if (!comment) {
      res.status(400).json({ error: "Please write a comment for your review" });
      return;
    }

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    const userId = req.session.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(401).json({ error: "Authentication required" }); return; }

    // Verified purchase: does this user have a non-cancelled order containing this product?
    const purchaseMatch = await db
      .select({ id: orderItemsTable.id })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
      .where(
        and(
          eq(ordersTable.userId, userId),
          eq(orderItemsTable.productId, productId),
          ne(ordersTable.status, "cancelled")
        )
      )
      .limit(1);

    const verifiedPurchase = purchaseMatch.length > 0;

    const existing = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.productId, productId), eq(reviewsTable.userId, userId)))
      .limit(1);

    let review;
    if (existing[0]) {
      const updated = await db
        .update(reviewsTable)
        .set({ rating, title, comment, verifiedPurchase, customerName: user.name })
        .where(eq(reviewsTable.id, existing[0].id))
        .returning();
      review = updated[0];
    } else {
      const inserted = await db
        .insert(reviewsTable)
        .values({ productId, userId, customerName: user.name, rating, title, comment, verifiedPurchase })
        .returning();
      review = inserted[0];
    }

    await recomputeProductRating(productId);

    res.status(201).json({ review });
  } catch (err) {
    console.error("[reviews POST]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;