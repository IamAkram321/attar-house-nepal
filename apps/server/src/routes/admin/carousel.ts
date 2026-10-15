import { Router, type Request, type Response } from "express";
import { db, carouselSlidesTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";

const router: Router = Router();

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

/** GET /api/admin/carousel-slides — all slides (active + hidden) for management */
router.get("/carousel-slides", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(carouselSlidesTable)
      .orderBy(asc(carouselSlidesTable.sortOrder), desc(carouselSlidesTable.id));
    res.json({ slides: rows.map(toPublic), total: rows.length });
  } catch (err) {
    console.error("[admin/carousel-slides GET]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /api/admin/carousel-slides */
router.post("/carousel-slides", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const title = body.title ? String(body.title).trim() : "";
    const image = body.image ? String(body.image).trim() : "";
    if (!title) {
      res.status(400).json({ error: "Heading is required" });
      return;
    }
    if (!image) {
      res.status(400).json({ error: "Image URL is required" });
      return;
    }
    const sortOrder = body.sortOrder != null && body.sortOrder !== "" ? Number(body.sortOrder) : 0;
    const inserted = await db
      .insert(carouselSlidesTable)
      .values({
        title,
        description: body.description ? String(body.description) : null,
        image,
        ctaLabel: body.ctaLabel ? String(body.ctaLabel) : null,
        ctaHref: body.ctaHref ? String(body.ctaHref) : null,
        sortOrder: Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0,
        isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      })
      .returning();
    res.status(201).json({ slide: toPublic(inserted[0]) });
  } catch (err) {
    console.error("[admin/carousel-slides POST]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/admin/carousel-slides/:id */
router.put("/carousel-slides/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid slide ID" });
      return;
    }
    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) {
      const t = String(body.title).trim();
      if (!t) {
        res.status(400).json({ error: "Heading cannot be empty" });
        return;
      }
      patch.title = t;
    }
    if (body.description !== undefined) patch.description = body.description ? String(body.description) : null;
    if (body.image !== undefined) {
      const img = String(body.image).trim();
      if (!img) {
        res.status(400).json({ error: "Image URL cannot be empty" });
        return;
      }
      patch.image = img;
    }
    if (body.ctaLabel !== undefined) patch.ctaLabel = body.ctaLabel ? String(body.ctaLabel) : null;
    if (body.ctaHref !== undefined) patch.ctaHref = body.ctaHref ? String(body.ctaHref) : null;
    if (body.sortOrder !== undefined && body.sortOrder !== "") {
      const n = Number(body.sortOrder);
      if (!Number.isFinite(n)) {
        res.status(400).json({ error: "Display order must be a number" });
        return;
      }
      patch.sortOrder = Math.trunc(n);
    }
    if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive);
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    const updated = await db
      .update(carouselSlidesTable)
      .set(patch)
      .where(eq(carouselSlidesTable.id, id))
      .returning();
    if (!updated.length) {
      res.status(404).json({ error: "Slide not found" });
      return;
    }
    res.json({ slide: toPublic(updated[0]) });
  } catch (err) {
    console.error("[admin/carousel-slides PUT]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /api/admin/carousel-slides/:id */
router.delete("/carousel-slides/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid slide ID" });
      return;
    }
    const deleted = await db.delete(carouselSlidesTable).where(eq(carouselSlidesTable.id, id)).returning();
    if (!deleted.length) {
      res.status(404).json({ error: "Slide not found" });
      return;
    }
    res.json({ success: true, slide: toPublic(deleted[0]) });
  } catch (err) {
    console.error("[admin/carousel-slides DELETE]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
