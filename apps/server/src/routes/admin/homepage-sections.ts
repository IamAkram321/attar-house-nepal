import { Router, type Request, type Response } from "express";
import { db, homepageSectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";
import { HOMEPAGE_SECTION_DEFAULTS } from "../homepage-sections";

const router: Router = Router();

function toPublic(row: typeof homepageSectionsTable.$inferSelect) {
  const defaults = HOMEPAGE_SECTION_DEFAULTS[row.key];
  return {
    id: row.id,
    key: row.key,
    eyebrow: row.eyebrow ?? defaults?.eyebrow ?? null,
    title: row.title,
    description: row.description,
    image: row.image,
    primaryCtaLabel: row.primaryCtaLabel,
    primaryCtaHref: row.primaryCtaHref,
    secondaryCtaLabel: row.secondaryCtaLabel,
    secondaryCtaHref: row.secondaryCtaHref,
    overlayTitle: row.overlayTitle,
    overlaySubtitle: row.overlaySubtitle,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

/** GET /api/admin/homepage-sections — all saved blocks (unsaved keys fall back to defaults on the storefront) */
router.get("/homepage-sections", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(homepageSectionsTable);
    res.json({
      sections: rows.map(toPublic),
      availableKeys: Object.keys(HOMEPAGE_SECTION_DEFAULTS),
    });
  } catch (err) {
    console.error("[admin/homepage-sections GET]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/admin/homepage-sections/:key — upsert a content block */
router.put("/homepage-sections/:key", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const key = String(req.params.key);
    if (!HOMEPAGE_SECTION_DEFAULTS[key]) {
      res.status(400).json({ error: "Unknown section" });
      return;
    }
    const body = req.body as Record<string, unknown>;
    const title = body.title !== undefined ? String(body.title).trim() : undefined;
    if (title !== undefined && !title) {
      res.status(400).json({ error: "Heading cannot be empty" });
      return;
    }
    const str = (v: unknown) => (v === undefined || v === null || String(v).trim() === "" ? null : String(v).trim());

    const values = {
      key,
      ...(title !== undefined ? { title } : {}),
      ...(body.eyebrow !== undefined ? { eyebrow: str(body.eyebrow) } : {}),
      ...(body.description !== undefined ? { description: str(body.description) } : {}),
      ...(body.image !== undefined ? { image: str(body.image) } : {}),
      ...(body.primaryCtaLabel !== undefined ? { primaryCtaLabel: str(body.primaryCtaLabel) } : {}),
      ...(body.primaryCtaHref !== undefined ? { primaryCtaHref: str(body.primaryCtaHref) } : {}),
      ...(body.secondaryCtaLabel !== undefined ? { secondaryCtaLabel: str(body.secondaryCtaLabel) } : {}),
      ...(body.secondaryCtaHref !== undefined ? { secondaryCtaHref: str(body.secondaryCtaHref) } : {}),
      ...(body.overlayTitle !== undefined ? { overlayTitle: str(body.overlayTitle) } : {}),
      ...(body.overlaySubtitle !== undefined ? { overlaySubtitle: str(body.overlaySubtitle) } : {}),
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
    };

    const existing = await db
      .select()
      .from(homepageSectionsTable)
      .where(eq(homepageSectionsTable.key, key))
      .limit(1);

    const saved = existing.length
      ? (
          await db
            .update(homepageSectionsTable)
            .set(values)
            .where(eq(homepageSectionsTable.key, key))
            .returning()
        )[0]
      : (await db.insert(homepageSectionsTable).values({ ...values, title: title ?? HOMEPAGE_SECTION_DEFAULTS[key].title }).returning())[0];

    res.json({ section: toPublic(saved) });
  } catch (err) {
    console.error("[admin/homepage-sections PUT]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
