import {
  pgTable,
  serial,
  text,
  decimal,
  boolean,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  description: text("description").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  category: text("category").notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  model3dUrl: text("model_3d_url"),
  materials: jsonb("materials").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  dimensions: text("dimensions"),
  weight: text("weight"),
  printTime: text("print_time"),
  inStock: boolean("in_stock").notNull().default(true),
  stock: integer("stock"),
  featured: boolean("featured").notNull().default(false),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  customizable: boolean("customizable").notNull().default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  createdByUserId: integer("created_by_user_id").references(() => usersTable.id, { onDelete: "set null" }),
  creationDurationSeconds: integer("creation_duration_seconds").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;