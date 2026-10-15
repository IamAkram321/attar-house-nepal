import { Router, Request, Response } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";

const router = Router();

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** GET /api/admin/categories — full list for catalogue management */
router.get("/categories", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(desc(categoriesTable.id));
    res.json({ categories, total: categories.length });
  } catch (err) {
    console.error("[admin/categories GET]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /api/admin/categories */
router.post("/categories", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    if (!body.name || !String(body.name).trim()) {
      res.status(400).json({ error: "name is required" }); return;
    }
    const name = String(body.name).trim();
    const inserted = await db.insert(categoriesTable).values({
      name,
      slug: slugify(name),
      description: body.description ? String(body.description) : null,
      image: body.image ? String(body.image) : null,
    }).returning();
    res.status(201).json({ category: inserted[0] });
  } catch (err: unknown) {
    console.error("[admin/categories POST]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique")) { res.status(409).json({ error: "A category with this name already exists" }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/admin/categories/:id */
router.put("/categories/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid category ID" }); return; }

    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (body.name != null && String(body.name).trim()) {
      patch.name = String(body.name).trim();
      patch.slug = slugify(String(body.name).trim());
    }
    if (body.description !== undefined) patch.description = body.description ? String(body.description) : null;
    if (body.image !== undefined) patch.image = body.image ? String(body.image) : null;

    if (!Object.keys(patch).length) { res.status(400).json({ error: "No fields to update" }); return; }

    const updated = await db.update(categoriesTable).set(patch).where(eq(categoriesTable.id, id)).returning();
    if (!updated.length) { res.status(404).json({ error: "Category not found" }); return; }
    res.json({ category: updated[0] });
  } catch (err) {
    console.error("[admin/categories PUT]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /api/admin/categories/:id — products keep their category text; only the shelf entry is removed */
router.delete("/categories/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid category ID" }); return; }

    const deleted = await db.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning();
    if (!deleted.length) { res.status(404).json({ error: "Category not found" }); return; }
    res.json({ success: true, category: deleted[0] });
  } catch (err) {
    console.error("[admin/categories DELETE]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
