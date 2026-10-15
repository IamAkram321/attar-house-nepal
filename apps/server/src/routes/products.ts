import { Router, type IRouter } from "express";
import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  ListFeaturedProductsResponse,
  GetProductResponse,
  ListRelatedProductsParams,
  ListRelatedProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { category, material, color, minPrice, maxPrice, sort, search, inStock, limit = 24, offset = 0 } = query.data;

  const conditions = [];

  if (category) {
    conditions.push(eq(productsTable.category, category));
  }
  if (inStock !== undefined) {
    conditions.push(eq(productsTable.inStock, inStock));
  }
  if (minPrice !== undefined) {
    conditions.push(gte(sql`${productsTable.price}::numeric`, minPrice));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(sql`${productsTable.price}::numeric`, maxPrice));
  }
  if (search) {
    conditions.push(ilike(productsTable.name, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countResult] = await Promise.all([
    db.select().from(productsTable).where(where).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  const mapped = products.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    rating: p.rating != null ? Number(p.rating) : null,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(ListProductsResponse.parse({ products: mapped, total }));
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.featured, true))
    .limit(8);

  const mapped = products.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    rating: p.rating != null ? Number(p.rating) : null,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(ListFeaturedProductsResponse.parse(mapped));
});

router.get("/products/:id/related", async (req, res): Promise<void> => {
  const params = ListRelatedProductsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const product = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id)).limit(1);
  if (!product[0]) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const related = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.category, product[0].category), sql`${productsTable.id} != ${params.data.id}`))
    .limit(4);

  const mapped = related.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    rating: p.rating != null ? Number(p.rating) : null,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(ListRelatedProductsResponse.parse(mapped));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = req.params.id;
  const isNumeric = /^\d+$/.test(raw);

  const [product] = isNumeric
    ? await db.select().from(productsTable).where(eq(productsTable.id, Number(raw)))
    : await db.select().from(productsTable).where(eq(productsTable.slug, raw));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(
    GetProductResponse.parse({
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
      rating: product.rating != null ? Number(product.rating) : null,
      createdAt: product.createdAt.toISOString(),
    }),
  );
});

export default router;