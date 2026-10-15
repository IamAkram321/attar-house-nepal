import { Router, Request, Response } from "express";
import { db, collectionsTable, collectionProductsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../../middleware/requireAuth";

const router = Router();

/** GET /api/admin/collections — list all collections with their assigned product ids */
router.get("/collections", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const collections = await db.select().from(collectionsTable);

    const links = await db.select().from(collectionProductsTable);
    const productIdsByCollection = new Map<number, number[]>();
    for (const link of links) {
      const list = productIdsByCollection.get(link.collectionId) ?? [];
      list.push(link.productId);
      productIdsByCollection.set(link.collectionId, list);
    }

    const result = collections.map((c) => ({
      ...c,
      productIds: productIdsByCollection.get(c.id) ?? [],
    }));

    res.json({ collections: result, total: result.length });
  } catch (err) {
    console.error("[admin/collections GET]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** GET /api/admin/collections/:id — single collection with assigned product ids */
router.get("/collections/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid collection ID" }); return; }

    const [collection] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, id));
    if (!collection) { res.status(404).json({ error: "Collection not found" }); return; }

    const links = await db.select().from(collectionProductsTable).where(eq(collectionProductsTable.collectionId, id));
    const productIds = links.map((l) => l.productId);

    res.json({ collection: { ...collection, productIds } });
  } catch (err) {
    console.error("[admin/collections GET :id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function setCollectionProducts(collectionId: number, productIds: number[]) {
  await db.delete(collectionProductsTable).where(eq(collectionProductsTable.collectionId, collectionId));
  if (productIds.length > 0) {
    await db.insert(collectionProductsTable).values(
      productIds.map((productId) => ({ collectionId, productId }))
    );
  }
  await db
    .update(collectionsTable)
    .set({ productCount: productIds.length })
    .where(eq(collectionsTable.id, collectionId));
}

/** POST /api/admin/collections */
router.post("/collections", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    if (!body.name) {
      res.status(400).json({ error: "name is required" }); return;
    }

    const slug = String(body.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const productIds = Array.isArray(body.productIds) ? (body.productIds as number[]) : [];

    const inserted = await db.insert(collectionsTable).values({
      name: String(body.name),
      slug,
      description: String(body.description ?? ""),
      image: String(body.image ?? ""),
      featured: Boolean(body.featured ?? false),
      productCount: productIds.length,
    }).returning();

    const collection = inserted[0];
    await setCollectionProducts(collection.id, productIds);

    res.status(201).json({ collection: { ...collection, productIds } });
  } catch (err: unknown) {
    console.error("[admin/collections POST]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique")) { res.status(409).json({ error: "A collection with this name already exists" }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/admin/collections/:id */
router.put("/collections/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid collection ID" }); return; }

    const body = req.body as Record<string, unknown>;
    const allowed = ["name", "description", "image", "featured"];
    const patch: Record<string, unknown> = {};
    for (const f of allowed) { if (f in body) patch[f] = body[f]; }

    if (Object.keys(patch).length) {
      const updated = await db.update(collectionsTable).set(patch).where(eq(collectionsTable.id, id)).returning();
      if (!updated.length) { res.status(404).json({ error: "Collection not found" }); return; }
    }

    if (Array.isArray(body.productIds)) {
      await setCollectionProducts(id, body.productIds as number[]);
    }

    const [collection] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, id));
    if (!collection) { res.status(404).json({ error: "Collection not found" }); return; }

    const links = await db.select().from(collectionProductsTable).where(eq(collectionProductsTable.collectionId, id));
    res.json({ collection: { ...collection, productIds: links.map((l) => l.productId) } });
  } catch (err) {
    console.error("[admin/collections PUT]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /api/admin/collections/:id */
router.delete("/collections/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid collection ID" }); return; }

    await db.delete(collectionProductsTable).where(eq(collectionProductsTable.collectionId, id));
    const deleted = await db.delete(collectionsTable).where(eq(collectionsTable.id, id)).returning();
    if (!deleted.length) { res.status(404).json({ error: "Collection not found" }); return; }

    res.json({ success: true, collection: deleted[0] });
  } catch (err) {
    console.error("[admin/collections DELETE]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** GET /api/admin/collections-product-picker — lightweight product list for the assign-products UI */
router.get("/products-picker", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await db
      .select({ id: productsTable.id, name: productsTable.name, category: productsTable.category })
      .from(productsTable);
    res.json({ products });
  } catch (err) {
    console.error("[admin/products-picker GET]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;