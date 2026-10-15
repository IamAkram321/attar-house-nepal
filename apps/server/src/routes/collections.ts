import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, collectionsTable, collectionProductsTable, productsTable } from "@workspace/db";
import {
  ListCollectionsResponse,
  GetCollectionParams,
  GetCollectionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/collections", async (_req, res): Promise<void> => {
  const collections = await db.select().from(collectionsTable);
  res.json(ListCollectionsResponse.parse(collections));
});

router.get("/collections/:slug", async (req, res): Promise<void> => {
  const params = GetCollectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [collection] = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.slug, params.data.slug));

  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  const links = await db
    .select()
    .from(collectionProductsTable)
    .where(eq(collectionProductsTable.collectionId, collection.id));

  const productIds = links.map((l) => l.productId);

  const products =
    productIds.length > 0
      ? await db.select().from(productsTable).where(eq(productsTable.id, productIds[0]))
      : [];

  // Fetch all products for this collection
  let collectionProducts: typeof products = [];
  if (productIds.length > 0) {
    collectionProducts = await Promise.all(
      productIds.map(async (pid) => {
        const [p] = await db.select().from(productsTable).where(eq(productsTable.id, pid));
        return p;
      }),
    ).then((results) => results.filter(Boolean));
  }

  const mappedProducts = collectionProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    rating: p.rating != null ? Number(p.rating) : null,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(
    GetCollectionResponse.parse({
      ...collection,
      products: mappedProducts,
    }),
  );
});

export default router;
