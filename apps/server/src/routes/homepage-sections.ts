import { Router, type IRouter } from "express";
import { db, homepageSectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface HomepageSectionContent {
  key: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  image: string | null;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  overlayTitle: string | null;
  overlaySubtitle: string | null;
  sortOrder: number;
  isActive: boolean;
}

/** Bundled defaults — shown until an admin saves the section. */
export const HOMEPAGE_SECTION_DEFAULTS: Record<string, HomepageSectionContent> = {
  "why-attar": {
    key: "why-attar",
    eyebrow: "Why attar",
    title: "Concentrated oils, honest sizes",
    description:
      "Small bottles, profound presence. Concentrated, alcohol-free oils worn close to the skin — from a 3ml discovery to a 12ml devotion, every oil lists only its own sizes, each honestly priced.",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200",
    primaryCtaLabel: "Shop attars",
    primaryCtaHref: "/shop?kind=attar",
    secondaryCtaLabel: "How to apply",
    secondaryCtaHref: "/faq",
    overlayTitle: "3ml · 6ml · 9ml · 10ml · 12ml",
    overlaySubtitle: "Alcohol-free concentrated oils — sizes and prices shown per product.",
    sortOrder: 0,
    isActive: true,
  },
};

function toPublic(
  row: typeof homepageSectionsTable.$inferSelect,
  defaults: HomepageSectionContent
): HomepageSectionContent {
  return {
    key: row.key,
    eyebrow: row.eyebrow ?? defaults.eyebrow,
    title: row.title ?? defaults.title,
    description: row.description ?? defaults.description,
    image: row.image ?? defaults.image,
    primaryCtaLabel: row.primaryCtaLabel ?? defaults.primaryCtaLabel,
    primaryCtaHref: row.primaryCtaHref ?? defaults.primaryCtaHref,
    secondaryCtaLabel: row.secondaryCtaLabel ?? defaults.secondaryCtaLabel,
    secondaryCtaHref: row.secondaryCtaHref ?? defaults.secondaryCtaHref,
    overlayTitle: row.overlayTitle ?? defaults.overlayTitle,
    overlaySubtitle: row.overlaySubtitle ?? defaults.overlaySubtitle,
    sortOrder: row.sortOrder ?? defaults.sortOrder,
    isActive: row.isActive ?? defaults.isActive,
  };
}

const router: IRouter = Router();

/** GET /homepage-sections/:key — public content block (defaults when never saved) */
router.get("/homepage-sections/:key", async (req, res): Promise<void> => {
  try {
    const key = String(req.params.key);
    const defaults = HOMEPAGE_SECTION_DEFAULTS[key];
    if (!defaults) {
      res.status(404).json({ error: "Unknown section" });
      return;
    }
    const rows = await db
      .select()
      .from(homepageSectionsTable)
      .where(eq(homepageSectionsTable.key, key))
      .limit(1);
    if (!rows.length) {
      res.json({ section: defaults, customized: false });
      return;
    }
    res.json({ section: toPublic(rows[0], defaults), customized: true });
  } catch (err) {
    console.error("[homepage-sections GET] (returning defaults)", err);
    const defaults = HOMEPAGE_SECTION_DEFAULTS[String(req.params.key)];
    if (defaults) {
      res.json({ section: defaults, customized: false });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
