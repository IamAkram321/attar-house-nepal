import { pgTable, serial, text, integer, decimal, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cartSessionsTable = pgTable("cart_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image").notNull().default(""),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  color: text("color"),
  material: text("material"),
  personalization: text("personalization"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  // Every cart read/write filters by sessionId — this is the hottest lookup
  // path in the whole app (hit on nearly every page load).
  index("cart_items_session_id_idx").on(table.sessionId),
  index("cart_items_product_id_idx").on(table.productId),
]);

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true, createdAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItemsTable.$inferSelect;