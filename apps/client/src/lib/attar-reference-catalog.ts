/**
 * Attar House Nepal — Editable Reference Catalog (DRAFTS)
 * ========================================================
 * HOW TO USE (owner):
 * 1. Each entry below is a REFERENCE DRAFT, not verified inventory.
 * 2. Edit in this file: set `price` (NPR), confirm `colors` sizes
 *    (6ml / 8ml / 9ml / 9.9ml / 10ml / 12ml / 20ml / 100ml spray),
 *    and replace `materials` notes with your supplier sheet or your own
 *    smelling-panel notes.
 * 3. Delete any draft you don't stock. Rename `name`/`slug` to your exact
 *    shelf name. Then create the same product in /admin → Catalog.
 * 4. Notes below are paraphrased from public sources (brand sites,
 *    Fragrantica, retailer listings, Oct 2026 research) and are flagged
 *    `needsVerification: true`. Do NOT treat them as COA/lab claims.
 *
 * No prices are invented here — every draft has NO price until you set it.
 */

import type { Product } from "@/components/product/ProductCard";

export interface AttarReferenceDraft extends Product {
  brand?: string;
  referenceDraft?: boolean;
  source?: string;
  needsVerification?: boolean;
  originSlug?: string;
  familySlug?: string;
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1200`;

const IMG_OUD = img("photo-1592945403244-b3fbafd7f539");
const IMG_ROSE = img("photo-1547887537-6158d64c35b3");
const IMG_MUSK = img("photo-1594035910387-fea47794261f");
const IMG_AMBER = img("photo-1523293182086-7651a899d37f");
const IMG_FRESH = img("photo-1616949755610-8c9bbc08f138");
const IMG_WOOD = img("photo-1588405748880-12d1d2a59f75");

function draft(d: AttarReferenceDraft): Product {
  return d as unknown as Product;
}

export const ATTAR_SIZE_PRESETS = {
  alNuaimOil: ["6ml", "9.9ml"],
  alNuaimLarge: ["6ml", "9.9ml", "20ml"],
  alRehabOil: ["3ml", "6ml", "12ml"],
  ajmalOil: ["3ml", "6ml", "12ml"],
  adilQadriOil: ["5.5ml", "10ml", "12ml"],
  spray100: ["100ml EDP spray"],
  multiSmall: ["6ml", "8ml", "9ml", "12ml"],
} as const;

/**
 * Reference drafts — Al-Nuaim / Al-Rehab / Ajmal / Adil Qadri
 * + Khamrah / Chocolate Musk / Hawas / 9PM / Exotic / Classic
 */
export const ATTAR_REFERENCE_DRAFTS: Product[] = [
  // ---------- Al-Nuaim ----------
  draft({
    id: 901, brand: "Al-Nuaim", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "arabian-classic",
    source: "Public listings: Silver Series 6ml roll-on; notes paraphrased from Fragrantica/retailers — confirm with supplier sheet.",
    name: "Al-Nuaim Chocolate Musk 6ml — EDIT ME",
    slug: "ref-al-nuaim-chocolate-musk-6ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Warm spicy, cocoa", "Heart: Milk chocolate, vanilla, powdery sweet", "Base: White musk, amber, balsamic"],
    colors: ["6ml", "9ml", "12ml"],
    images: [IMG_AMBER, IMG_MUSK],
    shortDescription: "Reference draft: sweet chocolate-vanilla musk oil. Set NPR price + confirm sizes before selling.",
    featured: false,
  }),
  draft({
    id: 902, brand: "Al-Nuaim", referenceDraft: true, needsVerification: true,
    familySlug: "musk", originSlug: "arabian-classic",
    source: "Public listings: 07 Series Mushk Tahara — clean musk tradition; confirm notes with supplier.",
    name: "Al-Nuaim Mushk Tahara 6ml — EDIT ME",
    slug: "ref-al-nuaim-mushk-tahara-6ml",
    category: "Musk Attars",
    materials: ["Top: Clean aldehydic lift — to confirm", "Heart: White musk, powdery", "Base: Soft soapy musk veil — to confirm"],
    colors: ["6ml", "9ml"],
    images: [IMG_MUSK],
    shortDescription: "Reference draft: purity-ritual white musk. Set NPR price + confirm notes.",
    featured: false,
  }),
  draft({
    id: 903, brand: "Al-Nuaim", referenceDraft: true, needsVerification: true,
    familySlug: "oud", originSlug: "arabian-classic",
    source: "Brand site Royale/Ameer series 9.9ml roll-on — exact pyramid not published; needs supplier sheet.",
    name: "Al-Nuaim Ameer Al Oudh 9.9ml — EDIT ME",
    slug: "ref-al-nuaim-ameer-al-oudh-9-9ml",
    category: "Oud & Hindi Oud",
    materials: ["Top: To confirm with supplier", "Heart: Oudh, woody — to confirm", "Base: Amber, musk — to confirm"],
    colors: ["9.9ml", "6ml"],
    images: [IMG_OUD],
    shortDescription: "Reference draft: Royale-series oudh. Confirm pyramid + set NPR price.",
    featured: false,
  }),
  draft({
    id: 904, brand: "Al-Nuaim", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "arabian-classic",
    source: "Brand site Royale series Black Orchid 9.9ml — notes not published; needs supplier sheet.",
    name: "Al-Nuaim Black Orchid 9.9ml — EDIT ME",
    slug: "ref-al-nuaim-black-orchid-9-9ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: To confirm", "Heart: Dark orchid accord — to confirm", "Base: Musk, amber — to confirm"],
    colors: ["9.9ml"],
    images: [IMG_AMBER],
    shortDescription: "Reference draft. Confirm notes + set NPR price.",
    featured: false,
  }),
  draft({
    id: 905, brand: "Al-Nuaim", referenceDraft: true, needsVerification: true,
    familySlug: "floral", originSlug: "arabian-classic",
    source: "Brand site Royale series White Orchid 9.9ml — notes not published.",
    name: "Al-Nuaim White Orchid 9.9ml — EDIT ME",
    slug: "ref-al-nuaim-white-orchid-9-9ml",
    category: "Floral Attars",
    materials: ["Top: To confirm", "Heart: White floral — to confirm", "Base: White musk — to confirm"],
    colors: ["9.9ml"],
    images: [IMG_ROSE],
    shortDescription: "Reference draft. Confirm notes + set NPR price.",
    featured: false,
  }),
  draft({
    id: 906, brand: "Al-Nuaim", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "arabian-classic",
    source: "AllAttar Nepal video: limited-edition Hawas attar — exact notes not published; needs supplier sheet.",
    name: "Al-Nuaim Hawas Attar 9.9ml — EDIT ME",
    slug: "ref-al-nuaim-hawas-9-9ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Aquatic-fruity — to confirm", "Heart: To confirm", "Base: Musk, woods — to confirm"],
    colors: ["9.9ml", "6ml"],
    images: [IMG_FRESH],
    shortDescription: "Reference draft: limited Hawas oil. Confirm pyramid + set NPR price.",
    featured: false,
  }),
  draft({
    id: 907, brand: "Al-Nuaim", referenceDraft: true, needsVerification: true,
    familySlug: "amber", originSlug: "arabian-classic",
    source: "Retailer listings: Dubai Gold 6ml alcohol-free oil — notes not published; needs supplier sheet.",
    name: "Al-Nuaim Dubai Gold 6ml — EDIT ME",
    slug: "ref-al-nuaim-dubai-gold-6ml",
    category: "Amber & Resins",
    materials: ["Top: To confirm", "Heart: Warm sweet amber — to confirm", "Base: Musk — to confirm"],
    colors: ["6ml", "9ml", "12ml"],
    images: [IMG_AMBER],
    shortDescription: "Reference draft. Confirm notes + set NPR price.",
    featured: false,
  }),

  // ---------- Al-Rehab ----------
  draft({
    id: 911, brand: "Al-Rehab", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "arabian-classic",
    source: "Fragrantica + retailers: Choco Musk 6ml CPO — vanilla/milk-chocolate/white-musk paraphrase; confirm.",
    name: "Al-Rehab Choco Musk 6ml — EDIT ME",
    slug: "ref-al-rehab-choco-musk-6ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Warm spicy, amber", "Heart: Milk chocolate, vanilla, powdery sweet", "Base: White musk, cacao, balsamic"],
    colors: ["3ml", "6ml", "12ml"],
    images: [IMG_AMBER],
    shortDescription: "Reference draft: classic gourmand oil. Set NPR price + confirm sizes.",
    featured: true,
  }),
  draft({
    id: 912, brand: "Al-Rehab", referenceDraft: true, needsVerification: true,
    familySlug: "musk", originSlug: "arabian-classic",
    source: "Bestseller-set listings: White Musk 6ml — confirm notes with supplier.",
    name: "Al-Rehab White Musk 6ml — EDIT ME",
    slug: "ref-al-rehab-white-musk-6ml",
    category: "Musk Attars",
    materials: ["Top: To confirm", "Heart: White musk — to confirm", "Base: Soft musk veil — to confirm"],
    colors: ["3ml", "6ml", "12ml"],
    images: [IMG_MUSK],
    shortDescription: "Reference draft. Set NPR price.",
    featured: false,
  }),
  draft({
    id: 913, brand: "Al-Rehab", referenceDraft: true, needsVerification: true,
    familySlug: "floral", originSlug: "arabian-classic",
    source: "Bestseller-set listings: Red Rose 6ml — confirm notes.",
    name: "Al-Rehab Red Rose 6ml — EDIT ME",
    slug: "ref-al-rehab-red-rose-6ml",
    category: "Floral Attars",
    materials: ["Top: To confirm", "Heart: Rose — to confirm", "Base: Musk — to confirm"],
    colors: ["6ml", "12ml"],
    images: [IMG_ROSE],
    shortDescription: "Reference draft. Set NPR price.",
    featured: false,
  }),
  draft({
    id: 914, brand: "Al-Rehab", referenceDraft: true, needsVerification: true,
    familySlug: "oud", originSlug: "arabian-classic",
    source: "Bestseller-set listings: Sultan Al Oud 6ml — confirm notes.",
    name: "Al-Rehab Sultan Al Oud 6ml — EDIT ME",
    slug: "ref-al-rehab-sultan-al-oud-6ml",
    category: "Oud & Hindi Oud",
    materials: ["Top: To confirm", "Heart: Oud accord — to confirm", "Base: Musk, woods — to confirm"],
    colors: ["6ml", "12ml"],
    images: [IMG_OUD],
    shortDescription: "Reference draft. Set NPR price.",
    featured: false,
  }),
  draft({
    id: 915, brand: "Al-Rehab", referenceDraft: true, needsVerification: true,
    familySlug: "amber", originSlug: "arabian-classic",
    source: "Retailer paraphrase: Golden Sand — warm sweet amber musky; confirm with supplier.",
    name: "Al-Rehab Golden Sand 6ml — EDIT ME",
    slug: "ref-al-rehab-golden-sand-6ml",
    category: "Amber & Resins",
    materials: ["Top: Warm sweet — to confirm", "Heart: Amber — to confirm", "Base: Musk — to confirm"],
    colors: ["6ml"],
    images: [IMG_AMBER],
    shortDescription: "Reference draft. Set NPR price.",
    featured: false,
  }),
  draft({
    id: 916, brand: "Al-Rehab", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "arabian-classic",
    source: "Retailer paraphrase: Khaliji — spicy-sweet citrus floral, golden flower, fresh musk; confirm.",
    name: "Al-Rehab Khaliji 6ml — EDIT ME",
    slug: "ref-al-rehab-khaliji-6ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Spicy-sweet citrus — to confirm", "Heart: Golden flower, floral — to confirm", "Base: Fresh musk — to confirm"],
    colors: ["6ml"],
    images: [IMG_FRESH],
    shortDescription: "Reference draft: classic Gulf blend. Set NPR price.",
    featured: false,
  }),
  draft({
    id: 917, brand: "Al-Rehab", referenceDraft: true, needsVerification: true,
    familySlug: "floral", originSlug: "arabian-classic",
    source: "Fragrantica paraphrase: Lovely — magnolia/quince/bergamot, white flowers/jasmine; confirm.",
    name: "Al-Rehab Lovely 6ml — EDIT ME",
    slug: "ref-al-rehab-lovely-6ml",
    category: "Floral Attars",
    materials: ["Top: Magnolia, quince, bergamot — to confirm", "Heart: White flowers, jasmine — to confirm", "Base: Musk — to confirm"],
    colors: ["6ml"],
    images: [IMG_ROSE],
    shortDescription: "Reference draft. Set NPR price.",
    featured: false,
  }),
  draft({
    id: 918, brand: "Al-Rehab", referenceDraft: true, needsVerification: true,
    familySlug: "herbal", originSlug: "arabian-classic",
    source: "Retailer paraphrase: Station — marine + amber/vanilla, myrrh bitter; confirm.",
    name: "Al-Rehab Station 6ml (Classic fresh) — EDIT ME",
    slug: "ref-al-rehab-station-classic-6ml",
    category: "Herbal & Earthy",
    materials: ["Top: Marine fresh — to confirm", "Heart: Amber — to confirm", "Base: Vanilla, myrrh — to confirm"],
    colors: ["6ml"],
    images: [IMG_FRESH],
    shortDescription: "Reference draft for 'Classic' fresh slot. Confirm identity + NPR price.",
    featured: false,
  }),

  // ---------- Ajmal ----------
  draft({
    id: 921, brand: "Ajmal", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "arabian-classic",
    source: "Ajmal blogs: mukhallat = oud + rose + saffron + sandal + amber + musk; 235 blend incl. Dahn Al Oudh — confirm lot.",
    name: "Ajmal Mukhallat 6ml — EDIT ME",
    slug: "ref-ajmal-mukhallat-6ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Rose, saffron, spices — to confirm", "Heart: Amber — to confirm", "Base: Dahn Al Oudh, musk, sandal — to confirm"],
    colors: ["3ml", "6ml", "12ml"],
    images: [IMG_OUD],
    shortDescription: "Reference draft: classic mukhallat. Confirm oud lot + NPR price.",
    featured: false,
  }),
  draft({
    id: 922, brand: "Ajmal", referenceDraft: true, needsVerification: true,
    familySlug: "oud", originSlug: "arabian-classic",
    source: "Ajmal Dahn Al Oudh line — origin lot (Hindi/Cambodi) must be confirmed; do not claim pure without COA.",
    name: "Ajmal Dahn Al Oudh 3ml — EDIT ME",
    slug: "ref-ajmal-dahn-al-oudh-3ml",
    category: "Oud & Hindi Oud",
    materials: ["Top: To confirm by lot", "Heart: Agarwood — to confirm by lot", "Base: Deep wood — to confirm by lot"],
    colors: ["3ml", "6ml"],
    images: [IMG_WOOD],
    shortDescription: "Reference draft: pure-oud slot. COA + lot required before any 'pure' claim.",
    featured: false,
  }),
  draft({
    id: 923, brand: "Ajmal", referenceDraft: true, needsVerification: true,
    familySlug: "woody", originSlug: "dubai-modern",
    source: "Fragrantica: Amber Wood family — confirm exact pyramid with supplier.",
    name: "Ajmal Amber Wood (oil/spray) — EDIT ME",
    slug: "ref-ajmal-amber-wood",
    category: "Woody & Sacred Woods",
    materials: ["Top: To confirm", "Heart: Amber, woods — to confirm", "Base: Musk — to confirm"],
    colors: ["6ml", "100ml EDP spray"],
    images: [IMG_WOOD],
    shortDescription: "Reference draft. Confirm format (oil vs spray) + NPR price.",
    featured: false,
  }),

  // ---------- Adil Qadri ----------
  draft({
    id: 931, brand: "Adil Qadri", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "dubai-modern",
    source: "Brand site: Shanaya bestseller, Arabic-French sweet blend, 5.5/10/12ml roll-on — brand publishes no full pyramid; needs smelling panel.",
    name: "Adil Qadri Shanaya 5.5ml — EDIT ME",
    slug: "ref-adil-qadri-shanaya-5-5ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Sweet blend — to confirm by panel", "Heart: To confirm by panel", "Base: To confirm by panel"],
    colors: ["5.5ml", "10ml", "12ml"],
    images: [IMG_AMBER],
    shortDescription: "Reference draft: Shanaya bestseller. Panel notes + NPR price required.",
    featured: true,
  }),
  draft({
    id: 932, brand: "Adil Qadri", referenceDraft: true, needsVerification: true,
    familySlug: "oud", originSlug: "arabian-classic",
    source: "Brand site: White Oudh 5.5ml roll-on — no published pyramid; needs panel.",
    name: "Adil Qadri White Oudh 5.5ml — EDIT ME",
    slug: "ref-adil-qadri-white-oudh-5-5ml",
    category: "Oud & Hindi Oud",
    materials: ["Top: To confirm", "Heart: White oudh accord — to confirm", "Base: Musk — to confirm"],
    colors: ["5.5ml", "12ml"],
    images: [IMG_OUD],
    shortDescription: "Reference draft. Panel + NPR price required.",
    featured: false,
  }),
  draft({
    id: 933, brand: "Adil Qadri", referenceDraft: true, needsVerification: true,
    familySlug: "oud", originSlug: "arabian-classic",
    source: "Brand site: Oudh Al Hashmi 5.5ml — no published pyramid.",
    name: "Adil Qadri Oudh Al Hashmi 5.5ml — EDIT ME",
    slug: "ref-adil-qadri-oudh-al-hashmi-5-5ml",
    category: "Oud & Hindi Oud",
    materials: ["Top: To confirm", "Heart: Oudh — to confirm", "Base: To confirm"],
    colors: ["5.5ml"],
    images: [IMG_WOOD],
    shortDescription: "Reference draft. Panel + NPR price required.",
    featured: false,
  }),
  draft({
    id: 934, brand: "Adil Qadri", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "dubai-modern",
    source: "Brand site: Shanaya Gold gourmand 5.5ml — no published pyramid.",
    name: "Adil Qadri Shanaya Gold 5.5ml — EDIT ME",
    slug: "ref-adil-qadri-shanaya-gold-5-5ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Gourmand sweet — to confirm", "Heart: To confirm", "Base: To confirm"],
    colors: ["5.5ml"],
    images: [IMG_AMBER],
    shortDescription: "Reference draft. Panel + NPR price required.",
    featured: false,
  }),
  draft({
    id: 935, brand: "Adil Qadri", referenceDraft: true, needsVerification: true,
    familySlug: "musk", originSlug: "hindi-heritage",
    source: "Brand site: Kasturi Musk 5.5ml — no published pyramid.",
    name: "Adil Qadri Kasturi Musk 5.5ml — EDIT ME",
    slug: "ref-adil-qadri-kasturi-musk-5-5ml",
    category: "Musk Attars",
    materials: ["Top: To confirm", "Heart: Musk — to confirm", "Base: To confirm"],
    colors: ["5.5ml"],
    images: [IMG_MUSK],
    shortDescription: "Reference draft. Panel + NPR price required.",
    featured: false,
  }),
  draft({
    id: 936, brand: "Adil Qadri", referenceDraft: true, needsVerification: true,
    familySlug: "indian-heritage", originSlug: "hindi-heritage",
    source: "Brand site: Kesar Chandan 5.5ml — saffron-sandal tradition; confirm pyramid by panel.",
    name: "Adil Qadri Kesar Chandan 5.5ml — EDIT ME",
    slug: "ref-adil-qadri-kesar-chandan-5-5ml",
    category: "Traditional Indian Attars",
    materials: ["Top: Saffron — to confirm", "Heart: To confirm", "Base: Sandal — to confirm"],
    colors: ["5.5ml"],
    images: [IMG_WOOD],
    shortDescription: "Reference draft: kesar-chandan. Panel + NPR price required.",
    featured: false,
  }),

  // ---------- Dubai modern sprays / oils ----------
  draft({
    id: 941, brand: "Lattafa", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "dubai-modern",
    source: "Widely published (retailers/Fragrantica): Khamrah cinnamon-dates-vanilla pyramid — still confirm supplier sheet.",
    name: "Lattafa Khamrah 100ml — EDIT ME",
    slug: "ref-lattafa-khamrah-100ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Cinnamon, nutmeg, bergamot — to confirm", "Heart: Dates, praline, tuberose — to confirm", "Base: Vanilla, tonka, amberwood, myrrh, benzoin — to confirm"],
    colors: ["100ml EDP spray", "6ml oil (if stocked)"],
    images: [IMG_AMBER],
    shortDescription: "Reference draft: Khamrah gourmand. Confirm oil vs spray + NPR price.",
    featured: true,
  }),
  draft({
    id: 942, brand: "Rasasi", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "dubai-modern",
    source: "Guides 2026 paraphrase: Hawas aquatic-fruity (bergamot/apple/cinnamon, plum/cardamom/aquatic, ambergris/musk/patchouli) — confirm variant (Him/Ice/Black).",
    name: "Rasasi Hawas (Him) 100ml — EDIT ME",
    slug: "ref-rasasi-hawas-him-100ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Bergamot, apple, cinnamon — to confirm", "Heart: Plum, cardamom, aquatic — to confirm", "Base: Ambergris, musk, patchouli, woods — to confirm"],
    colors: ["100ml EDP spray", "6ml oil (if stocked)"],
    images: [IMG_FRESH],
    shortDescription: "Reference draft: specify Him / Ice / Black. Confirm + set NPR price.",
    featured: true,
  }),
  draft({
    id: 943, brand: "Rasasi", referenceDraft: true, needsVerification: true,
    familySlug: "herbal", originSlug: "dubai-modern",
    source: "Fragrantica 2026: Hawas Exotic (coconut/mugwort/lavender/cardamom, orris/jasmine; base TBD) — confirm.",
    name: "Rasasi Hawas Exotic — EDIT ME",
    slug: "ref-rasasi-hawas-exotic",
    category: "Herbal & Earthy",
    materials: ["Top: Coconut, mugwort, lavender, cardamom — to confirm", "Heart: Orris, jasmine — to confirm", "Base: To confirm"],
    colors: ["100ml EDP spray"],
    images: [IMG_FRESH],
    shortDescription: "Reference draft for 'Exotic' slot. Confirm variant + NPR price.",
    featured: false,
  }),
  draft({
    id: 944, brand: "Afnan", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "dubai-modern",
    source: "Fragrantica: Afnan 9PM (apple/cinnamon/lavender/bergamot, orange blossom/lily, vanilla/tonka/amber) — confirm.",
    name: "Afnan 9PM 100ml — EDIT ME",
    slug: "ref-afnan-9pm-100ml",
    category: "Mukhallat & Oriental Blends",
    materials: ["Top: Apple, cinnamon, wild lavender, bergamot — to confirm", "Heart: Orange blossom, lily — to confirm", "Base: Vanilla, tonka, amber — to confirm"],
    colors: ["100ml EDP spray"],
    images: [IMG_WOOD],
    shortDescription: "Reference draft: 9PM evening gourmand. Confirm + set NPR price.",
    featured: true,
  }),
  draft({
    id: 950, brand: "Attar House Nepal", referenceDraft: true, needsVerification: true,
    familySlug: "arabian-blends", originSlug: "dubai-modern",
    source: "House concept: 2ml trial vials across families for layering discovery — owner sets vial lineup + NPR price.",
    name: "Attar Discovery Set 5x2ml — EDIT ME",
    slug: "ref-ayesha-discovery-set-5x2ml",
    category: "Discovery Sets",
    materials: ["Top: 5 curated openings — to confirm lineup", "Heart: Floral, oud, musk, amber, blend — to confirm", "Base: Layering guide included — to confirm"],
    colors: ["5x2ml oils", "10x2ml oils (if offered)"],
    images: [IMG_MUSK, IMG_OUD],
    shortDescription: "Functional discovery SKU: 2ml vials + layering card. Set lineup + NPR price.",
    featured: true,
  }),
];

export const REFERENCE_BRANDS = ["Al-Nuaim", "Al-Rehab", "Ajmal", "Adil Qadri", "Lattafa", "Rasasi", "Afnan"] as const;
