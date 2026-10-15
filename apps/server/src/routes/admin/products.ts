import { Router, Request, Response } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, desc, and, or, ilike, lt, count } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";
import { getPaginationParams, buildPaginationMeta } from "../../lib/pagination";

const router = Router();

/** GET /api/admin/products */
router.get("/products", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, lowStock } = req.query as Record<string, string>;
    const pagination = getPaginationParams(req);

    const conditions = [
      search ? or(ilike(productsTable.name, `%${search}%`), ilike(productsTable.category, `%${search}%`)) : undefined,
      lowStock === "true" ? lt(productsTable.stock, 5) : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [products, [{ total }]] = await Promise.all([
      db.select().from(productsTable).where(where).orderBy(desc(productsTable.createdAt))
        .limit(pagination.limit).offset(pagination.offset),
      db.select({ total: count() }).from(productsTable).where(where),
    ]);

    res.json({ products, ...buildPaginationMeta(pagination, total) });
  } catch (err) {
    console.error("[admin/products GET]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /api/admin/products */
router.post("/products", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const price = body.price === "" || body.price == null ? undefined : Number(body.price);
    if (!body.name || price === undefined || Number.isNaN(price) || !body.category) {
      res.status(400).json({ error: "name, price, and category are required" }); return;
    }

    const slug = String(body.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const inserted = await db.insert(productsTable).values({
      name: String(body.name),
      slug,
      price: String(body.price),
      compareAtPrice: body.compareAtPrice ? String(body.compareAtPrice) : null,
      description: String(body.description ?? ""),
      shortDescription: String(body.shortDescription ?? ""),
      category: String(body.category),
      images: (body.images as string[]) ?? [],
      model3dUrl: body.model3dUrl ? String(body.model3dUrl) : null,
      materials: (body.materials as string[]) ?? [],
      colors: (body.colors as string[]) ?? [],
      dimensions: String(body.dimensions ?? ""),
      weight: String(body.weight ?? ""),
      printTime: String(body.printTime ?? ""),
      inStock: Boolean(body.inStock ?? true),
      stock: Number(body.stock ?? 0),
      featured: Boolean(body.featured ?? false),
      tags: (body.tags as string[]) ?? [],
      customizable: Boolean(body.customizable ?? false),
      rating: String(body.rating ?? "0"),
      reviewCount: Number(body.reviewCount ?? 0),
    }).returning();

    res.status(201).json({ product: inserted[0] });
  } catch (err: unknown) {
    console.error("[admin/products POST]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique")) { res.status(409).json({ error: "A product with this name already exists" }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/admin/products/:id */
router.put("/products/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid product ID" }); return; }

    const body = req.body as Record<string, unknown>;
    const allowed = ["name","price","compareAtPrice","description","shortDescription","category",
      "images","model3dUrl","materials","colors","dimensions","weight","printTime","inStock","stock",
      "featured","tags","customizable","rating","reviewCount"];

    const patch: Record<string, unknown> = {};
    for (const f of allowed) { if (f in body) patch[f] = body[f]; }

    if (!Object.keys(patch).length) { res.status(400).json({ error: "No fields to update" }); return; }

    const updated = await db.update(productsTable).set(patch).where(eq(productsTable.id, id)).returning();
    if (!updated.length) { res.status(404).json({ error: "Product not found" }); return; }
    res.json({ product: updated[0] });
  } catch (err) {
    console.error("[admin/products PUT]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /api/admin/products/:id */
router.delete("/products/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid product ID" }); return; }

    const deleted = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (!deleted.length) { res.status(404).json({ error: "Product not found" }); return; }
    res.json({ success: true, product: deleted[0] });
  } catch (err) {
    console.error("[admin/products DELETE]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;