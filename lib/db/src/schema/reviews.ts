import { pgTable, serial, text, integer, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  comment: text("comment").notNull(),
  // True if the reviewer has a non-cancelled order containing this product.
  verifiedPurchase: boolean("verified_purchase").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("reviews_product_id_idx").on(table.productId),
  // The app already enforces "one review per user per product" in
  // routes/reviews.ts, but that alone doesn't stop a race condition (two
  // near-simultaneous requests both passing the "does a review exist"
  // check before either has inserted). A real unique constraint makes this
  // impossible at the database level, not just in application logic.
  uniqueIndex("reviews_product_user_unique").on(table.productId, table.userId),
]);

export type Review = typeof reviewsTable.$inferSelect;