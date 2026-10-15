import { pgTable, serial, text, boolean, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collectionsTable = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  productCount: integer("product_count").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
});

export const insertCollectionSchema = createInsertSchema(collectionsTable).omit({ id: true });
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collectionsTable.$inferSelect;

export const collectionProductsTable = pgTable("collection_products", {
  collectionId: integer("collection_id").notNull(),
  productId: integer("product_id").notNull(),
}, (table) => [
  index("collection_products_collection_id_idx").on(table.collectionId),
  index("collection_products_product_id_idx").on(table.productId),
]);