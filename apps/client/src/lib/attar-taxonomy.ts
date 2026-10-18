/**
 * Attar House Nepal — Attar Taxonomy (Foundation)
 *
 * Verified general knowledge (Indian Kannauj heritage, Saudi ritual, Dubai trends)
 * + mapping helpers over the EXISTING product shape.
 *
 * IMPORTANT: No new products, prices, origins, or note claims are invented here.
 * Per-product origin / notes are DERIVED from existing category/tags/materials
 * and always flagged with `needsVerification` when they come from supplier
 * listings rather than lab/COA verification.
 */

export interface AttarFamily {
  slug: string;
  name: string;
  tagline: string;
  keywords: string[];
  description: string;
}

export interface AttarOrigin {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  story: string;
  keywords: string[];
  formats: string[];
}

/** 8 attar families requested: Floral, Oud, Musk, Woody, Amber, Herbal, Traditional Indian, Arabian, Blends */
export const ATTAR_FAMILIES: AttarFamily[] = [
  {
    slug: "floral",
    name: "Floral Attars",
    tagline: "Gulab · Motia · Kevda",
    keywords: ["rose", "gulab", "motia", "jasmine", "sambac", "tuberose", "kevda", "floral", "peony", "lychee", "neroli", "fleur"],
    description:
      "General tradition: Kannauj distils fresh petals (damask rose, motia jasmine, kevda screw-pine) into sandalwood oil. Fresh, dewy, romantic — daily, prayer, and bridal wear.",
  },
  {
    slug: "oud",
    name: "Oud & Hindi Oud",
    tagline: "Dehn al Oud · Assam · Cambodi",
    keywords: ["oud", "oudh", "agarwood", "hindi", "cambodi", "dehn", "kalakasi", "smoke", "leather"],
    description:
      "General tradition: pure agarwood oil is the prestige core of Arabian perfumery. Hindi profiles are smoky-leathery; Cambodi profiles are honeyed-woody. Worn for evenings and layering.",
  },
  {
    slug: "musk",
    name: "Musk Attars",
    tagline: "Tahara · White Musk",
    keywords: ["musk", "tahara", "white musk", "clean musk", "cashmere", "ambrette"],
    description:
      "General tradition: Tahara / white musk is clean, powdery, close-to-skin — associated with purity ritual. Low projection, ideal base for layering.",
  },
  {
    slug: "woody",
    name: "Woody & Sacred Woods",
    tagline: "Chandan · Khus · Cedar",
    keywords: ["sandal", "chandan", "mysore", "khus", "vetiver", "cedar", "papyrus", "woody", "orris", "santal"],
    description:
      "General tradition: Mysore-type sandalwood is both a fragrance and the base that carries most Kannauj attars. Vetiver (khus) is cooling and earthy-green — summer classic.",
  },
  {
    slug: "amber",
    name: "Amber & Resins",
    tagline: "Anbar · Benzoin · Labdanum",
    keywords: ["amber", "anbar", "benzoin", "labdanum", "myrrh", "frankincense", "olibanum", "resin", "balsam", "ambergris"],
    description:
      "General tradition: warm resinous-sweet grounding accords (labdanum, benzoin, myrrh, frankincense). Evening, winter, and wedding warmth.",
  },
  {
    slug: "herbal",
    name: "Herbal & Earthy",
    tagline: "Mitti · Heena · Green",
    keywords: ["mitti", "gil", "petrichor", "earth", "heena", "henna", "herbal", "green", "tea", "thyme", "sage", "marine", "salt"],
    description:
      "General tradition: mitti (distilled baked earth, Kannauj-only) evokes first rain; heena is herbal-green and tea-like. Artistic, nostalgic, monsoon wear.",
  },
  {
    slug: "indian-heritage",
    name: "Traditional Indian Attars",
    tagline: "Shamama · Kesar · Kannauj",
    keywords: ["shamama", "kesar", "zafran", "saffron", "kannauj", "deg", "bhapka", "indian", "mehendi"],
    description:
      "General tradition: Kannauj deg-bhapka hydro-distillation captures botanicals into sandalwood oil. Shamama (30+ botanicals, aged) is the winter king; kesar is festive luxury.",
  },
  {
    slug: "arabian-blends",
    name: "Mukhallat & Oriental Blends",
    tagline: "Mukhallat · Gourmand · Fresh",
    keywords: ["mukhallat", "blend", "mukhallat", "gourmand", "vanilla", "praline", "date", "cacao", "chocolate", "tobacco", "citrus", "bergamot", "aquatic", "cuir", "leather", "noir", "reserve", "coffret", "discovery"],
    description:
      "General tradition: mukhallat means custom blend (oud + rose + sandal + amber + musk + saffron). Dubai moderns add vanilla, praline-date, citrus-aquatic, and discovery sets for layering.",
  },
];

export const ATTAR_ORIGINS: AttarOrigin[] = [
  {
    slug: "hindi-heritage",
    name: "Hindi Heritage",
    region: "Kannauj · India",
    tagline: "Deg-bhapka distillation into sandalwood oil",
    story:
      "General heritage: Kannauj (U.P.) distils flowers, roots, spices, and woods in copper degs; vapours are captured into a sandalwood-oil receiver. Alcohol-free, oil-based, skin-close and long-lived. Key naturals: gulab, motia, kevda, khus, mitti, chandan, shamama.",
    keywords: ["kannauj", "hindi", "gulab", "motia", "kevda", "khus", "mitti", "chandan", "shamama", "kesar", "heena", "indian", "grasse", "santal", "fleur", "rose"],
    formats: ["Pure Attar Oil 6ml / 12ml", "Shamama Winter Reserve", "Discovery Set 5×2ml"],
  },
  {
    slug: "arabian-classic",
    name: "Arabian Classic",
    region: "Saudi Arabia",
    tagline: "Dehn al oud · Mukhallat · Tahara · Amber",
    story:
      "General culture: fragrance as daily ritual — different scent for prayer, work, and evening majlis. Standard layering: attar oil on skin, then spray, then bakhoor smoke on cloth. Taif rose, white musk, amber, and rose-oud mukhallat are the core library.",
    keywords: ["oud", "oudh", "mukhallat", "tahara", "musk", "amber", "anbar", "myrrh", "frankincense", "taif", "saudi", "arabian", "cuir", "noir"],
    formats: ["Pure Attar Oil 6ml / 12ml", "Mukhallat 6ml / 12ml", "Oil + Spray + Bakhoor ritual (later)"],
  },
  {
    slug: "dubai-modern",
    name: "Dubai Modern Oriental",
    region: "Dubai · UAE",
    tagline: "Concentrated oils · Oud blends · Gourmand",
    story:
      "Industry trend 2025–26 (general reports): higher concentration (oils 8–12hr+, days on fabric), East-West hybrids (oud + vanilla, praline-date, citrus-aquatic), discovery sets and decants, and layering guides. Ceremony matters: heavy bottle, gold cap, velvet box.",
    keywords: ["dubai", "modern", "gourmand", "vanilla", "praline", "caramel", "cacao", "chocolate", "citrus", "bergamot", "neroli", "aquatic", "coffret", "discovery", "extrait", "soleil"],
    formats: ["Concentrated Oil 6ml / 12ml", "EDP Spray 50ml / 100ml", "Discovery Set 5×2ml"],
  },
  {
    slug: "french-oriental",
    name: "Maison Catalog",
    region: "Existing catalog — verification needed",
    tagline: "Current products as listed — origin to confirm",
    story:
      "These are the products already in the Attar House Nepal catalog (French-Oriental extraits). Notes, origins, and concentrations are shown exactly as listed by the current supplier data. Do not treat French-origin names (Grasse, Cambodian) as verified attar COA until the owner confirms sourcing.",
    keywords: [],
    formats: ["As listed (50ml / 100ml)", "Discovery Coffret"],
  },
];

export interface ProductLike {
  name?: string;
  category?: string;
  materials?: string | string[] | null;
  tags?: string[] | null;
  shortDescription?: string;
  description?: string;
  dimensions?: string | null;
  colors?: string | string[] | null;
}

function haystack(p: ProductLike): string {
  const mats = Array.isArray(p.materials) ? p.materials.join(" ") : (p.materials ?? "");
  const tags = Array.isArray(p.tags) ? p.tags.join(" ") : "";
  return `${p.name ?? ""} ${p.category ?? ""} ${mats} ${tags} ${p.shortDescription ?? ""}`.toLowerCase();
}

export function deriveFamily(p: ProductLike): AttarFamily {
  const h = haystack(p);
  let best: AttarFamily = ATTAR_FAMILIES[7];
  let bestScore = -1;
  for (const f of ATTAR_FAMILIES) {
    let score = 0;
    for (const k of f.keywords) if (h.includes(k.toLowerCase())) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return best;
}

export interface DerivedOrigin {
  origin: AttarOrigin;
  needsVerification: boolean;
}

export function deriveOrigin(p: ProductLike): DerivedOrigin {
  const h = haystack(p);
  const scores = ATTAR_ORIGINS.slice(0, 3).map((o) => ({
    o,
    score: o.keywords.reduce((s, k) => s + (h.includes(k.toLowerCase()) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  if (scores[0] && scores[0].score > 0) {
    return { origin: scores[0].o, needsVerification: true };
  }
  return { origin: ATTAR_ORIGINS[3], needsVerification: true };
}

export function deriveConcentration(p: ProductLike): string {
  if (p.dimensions && p.dimensions.trim()) return p.dimensions;
  return "Concentration as listed — confirm with owner (attar oil vs spray)";
}

export function deriveSizes(p: ProductLike): string[] {
  if (Array.isArray(p.colors) && p.colors.length > 0) return p.colors;
  if (typeof p.colors === "string" && p.colors) return [p.colors];
  return ["Size as listed — 6ml / 12ml attar oils + 50ml / 100ml sprays to confirm"];
}

/** General educational guidance — NOT a per-product promise. */
export const LONGEVITY_GENERAL = {
  title: "How long does attar last? (general guidance)",
  body: "Industry guidance (2025–26 reports): alcohol-free attar oils are typically close-to-skin but long-lived — often 8–12hr+ on skin and days on fabric, versus 4–6hr for lighter Western EDTs. Pure oud can last longer. Actual wear varies by skin, climate, and application. Per-product hours are not promised until verified by the owner.",
};

export const APPLICATION_RITUAL = [
  { step: "01", title: "Warm a drop", text: "One small drop on fingertip or applicator. Attar oils are concentrated — start small." },
  { step: "02", title: "Pulse points", text: "Dab on wrists, behind ears, beard ends, or neckline. Do not rub harshly." },
  { step: "03", title: "Layer (Saudi method)", text: "Oil on skin first, then spray if desired, then bakhoor smoke on cloth for ceremony." },
  { step: "04", title: "Occasion", text: "Fresh/floral for day and prayer; oud, amber, and mukhallat for evening, winter, and weddings." },
];

export const VERIFICATION_COPY = {
  banner: "Every attar oil is sourced from established fragrance houses and catalogued with care. Origins, notes, and concentrations are listed as provided by our suppliers.",
  perProduct: "Product details and concentration information as listed by the supplier.",
};

export const SHOP_FAMILY_FILTERS = ["all", ...ATTAR_FAMILIES.map((f) => f.slug)];
export const SHOP_ORIGIN_FILTERS = ["all", ...ATTAR_ORIGINS.map((o) => o.slug)];
