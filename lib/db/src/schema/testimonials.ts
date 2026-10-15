import { pgTable, serial, text, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const testimonialsTable = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  avatar: text("avatar"),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("5"),
  text: text("text").notNull(),
  productPurchased: text("product_purchased"),
  location: text("location"),
});

export const insertTestimonialSchema = createInsertSchema(testimonialsTable).omit({ id: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonialsTable.$inferSelect;
