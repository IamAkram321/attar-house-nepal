import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable, cartSessionsTable, productsTable } from "@workspace/db";
import {
  AddCartItemBody,
  AddCartItemResponse,
  UpdateCartItemParams,
  UpdateCartItemBody,
  UpdateCartItemResponse,
  RemoveCartItemParams,
  RemoveCartItemResponse,
  GetCartResponse,
} from "@workspace/api-zod";

const CART_SESSION_COOKIE = "cart_session_id";

const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

async function getOrCreateSession(sessionId: string): Promise<void> {
  const existing = await db
    .select()
    .from(cartSessionsTable)
    .where(eq(cartSessionsTable.sessionId, sessionId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(cartSessionsTable).values({ sessionId });
  }
}

async function getCartBySession(sessionId: string) {
  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: items.map((item) => ({ ...item, price: Number(item.price) })),
    subtotal,
    itemCount,
  };
}

const router: IRouter = Router();

router.get("/cart", async (req, res): Promise<void> => {
  const sessionId = (req.cookies?.[CART_SESSION_COOKIE] as string | undefined) ?? "";
  if (!sessionId) {
    res.json(GetCartResponse.parse({ items: [], subtotal: 0, itemCount: 0 }));
    return;
  }
  const cart = await getCartBySession(sessionId);
  res.json(GetCartResponse.parse(cart));
});

router.post("/cart/items", async (req, res): Promise<void> => {
  let sessionId = (req.cookies?.[CART_SESSION_COOKIE] as string | undefined) ?? "";
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    res.cookie(CART_SESSION_COOKIE, sessionId, CART_COOKIE_OPTIONS);
  }

  await getOrCreateSession(sessionId);

  const parsed = AddCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity, color, material, personalization } = parsed.data;
  const rawBody = req.body as Record<string, unknown>;
  const sizeLabel = typeof rawBody.sizeLabel === "string" ? rawBody.sizeLabel : typeof material === "string" ? material : null;
  const askedPrice = typeof rawBody.unitPrice === "number" ? rawBody.unitPrice : null;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  // Per-size pricing is admin-managed via `size:<label>=<npr>` tags.
  // A client-supplied unit price is charged ONLY when it exactly matches the
  // tag for the requested size; otherwise the catalogue base price applies.
  let unitPrice = Number(product.price);
  if (sizeLabel && askedPrice != null && Number.isFinite(askedPrice) && askedPrice > 0) {
    const wanted = sizeLabel.trim().toLowerCase();
    const tags = (product.tags as string[] | null) ?? [];
    for (const tag of tags) {
      const m = String(tag).match(/^size\s*:\s*([^=]+?)\s*=\s*([\d.]+)\s*$/i);
      if (m && m[1].trim().toLowerCase() === wanted && Number(m[2]) === Number(askedPrice)) {
        unitPrice = Number(askedPrice);
        break;
      }
    }
  }

  const sessionItems = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));

  // Sizes are stored in `material`, so each size is its own cart line.
  const existing = sessionItems.find((row) => (row.material ?? null) === (material ?? null));

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity, price: String(unitPrice) })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      sessionId,
      productId,
      productName: product.name,
      productImage: (product.images as string[])?.[0] ?? "",
      price: String(unitPrice),
      quantity,
      color: color ?? null,
      material: material ?? null,
      personalization: personalization ?? null,
    });
  }

  const cart = await getCartBySession(sessionId);
  res.status(201).json(AddCartItemResponse.parse(cart));
});

router.put("/cart/items/:itemId", async (req, res): Promise<void> => {
  const sessionId = (req.cookies?.[CART_SESSION_COOKIE] as string | undefined) ?? "";

  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity: parsed.data.quantity })
      .where(eq(cartItemsTable.id, params.data.itemId));
  }

  const cart = await getCartBySession(sessionId);
  res.json(UpdateCartItemResponse.parse(cart));
});

router.delete("/cart/items/:itemId", async (req, res): Promise<void> => {
  const sessionId = (req.cookies?.[CART_SESSION_COOKIE] as string | undefined) ?? "";

  const params = RemoveCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));

  const cart = await getCartBySession(sessionId);
  res.json(RemoveCartItemResponse.parse(cart));
});

export default router;