import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Editable homepage content blocks (e.g. the "Why Attar" section).
 * The storefront falls back to bundled defaults when no row exists,
 * so the page works before an admin ever saves.
 */
export const homepageSectionsTable = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  eyebrow: text("eyebrow"),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  primaryCtaLabel: text("primary_cta_label"),
  primaryCtaHref: text("primary_cta_href"),
  secondaryCtaLabel: text("secondary_cta_label"),
  secondaryCtaHref: text("secondary_cta_href"),
  overlayTitle: text("overlay_title"),
  overlaySubtitle: text("overlay_subtitle"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHomepageSectionSchema = createInsertSchema(homepageSectionsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertHomepageSection = z.infer<typeof insertHomepageSectionSchema>;
export type HomepageSection = typeof homepageSectionsTable.$inferSelect;
