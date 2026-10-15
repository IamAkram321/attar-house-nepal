import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const carouselSlidesTable = pgTable("carousel_slides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image").notNull(),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCarouselSlideSchema = createInsertSchema(carouselSlidesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCarouselSlide = z.infer<typeof insertCarouselSlideSchema>;
export type CarouselSlide = typeof carouselSlidesTable.$inferSelect;
