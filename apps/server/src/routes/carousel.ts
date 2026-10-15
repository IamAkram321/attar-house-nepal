import { Router, type IRouter } from "express";
import { db, carouselSlidesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

function toPublic(row: typeof carouselSlidesTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

/** GET /carousel-slides — public active slides for the homepage hero */
router.get("/carousel-slides", async (_req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(carouselSlidesTable)
      .where(eq(carouselSlidesTable.isActive, true))
      .orderBy(asc(carouselSlidesTable.sortOrder), asc(carouselSlidesTable.id));
    res.json({ slides: rows.map(toPublic), total: rows.length });
  } catch (err) {
    // Table may not exist yet (fresh DB before `pnpm --filter @workspace/db push`).
    // Return empty so the storefront falls back to curated static slides.
    console.error("[carousel-slides GET] (returning empty fallback)", err);
    res.json({ slides: [], total: 0 });
  }
});

export default router;
