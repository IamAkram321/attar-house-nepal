import { useMemo } from "react";
import { useListProducts } from "@workspace/api-client-react";
import { deriveOrigin } from "./attar-taxonomy";

/**
 * Ayesha Fragrances — catalog presentation layer.
 *
 * The products table has no dedicated brand / gender / type columns, so all
 * discovery metadata is derived from ADMIN-MANAGED fields (no inventory invented):
 *
 *   Tags (comma-separated in /admin → Catalog):
 *     brand:Al-Nuaim        explicit brand (preserves exact casing)
 *     gender:for-him | gender:for-her | gender:unisex   (blank = Unisex by attar tradition)
 *     type:attar | type:perfume
 *     family:musk | family:oud | ... (one of SHOP_FAMILIES slugs)
 *     badge:bestseller | badge:new | badge:combo | badge:offer | badge:favourite
 *   Bare tags also work: "for-him", "unisex", "attar", "perfume",
 *   "combo", "offer", "sale", "new", "bestseller".
 *   Category / name / notes keywords are used as a fallback signal only.
 *   `featured` + `compareAtPrice > price` + `rating`/`reviewCount` are real data.
 */

export type Audience = "him" | "her" | "unisex";
export type Kind = "attar" | "perfume";
export type Badge = "bestseller" | "new" | "combo" | "offer" | "favourite";

export interface CatalogProduct {
  id: string | number;
  name: string;
  slug?: string;
  price?: number | null;
  compareAtPrice?: number | null;
  category?: string;
  materials?: string | string[] | null;
  colors?: string | string[] | null;
  dimensions?: string | null;
  images?: string[];
  imageUrl?: string;
  image_url?: string;
  image?: string;
  shortDescription?: string;
  description?: string;
  tags?: string[] | null;
  featured?: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  createdAt?: string;
  stock?: number | null;
  inStock?: boolean;
  brand?: string;
  referenceDraft?: boolean;
}

export interface SizeOption {
  label: string;
  price: number | null;
}

/**
 * Per-size pricing lives in tags as `size:6ml=349` (admin-managed, real NPR).
 * Plain sizes in `colors` fall back to the product base price.
 */
export function sizePrices(p: CatalogProduct): Map<string, number> {
  const map = new Map<string, number>();
  const tags = Array.isArray(p.tags) ? p.tags : [];
  for (const t of tags) {
    const m = String(t).match(/^size\s*:\s*([^=]+?)\s*=\s*([\d.]+)\s*$/i);
    if (m) map.set(m[1].trim().toLowerCase(), Number(m[2]));
  }
  return map;
}

export function sizeOptions(p: CatalogProduct): SizeOption[] {
  const raw = Array.isArray(p.colors) && p.colors.length > 0
    ? p.colors
    : typeof p.colors === "string" && p.colors
    ? [p.colors]
    : ["6ml"];
  const prices = sizePrices(p);
  const base = p.price != null && Number(p.price) > 0 ? Number(p.price) : null;
  return raw.map((label) => ({
    label,
    price: prices.get(label.trim().toLowerCase()) ?? base,
  }));
}

/** Lowest known price across sizes — "Starting Rs X". Null until priced. */
export function startingPrice(p: CatalogProduct): number | null {
  const prices = sizeOptions(p).map((s) => s.price).filter((v): v is number => v != null && v > 0);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

export function priceForSize(p: CatalogProduct, label: string): number | null {
  const found = sizeOptions(p).find((s) => s.label.trim().toLowerCase() === label.trim().toLowerCase());
  return found?.price ?? null;
}

export type StockStatus = "in" | "low" | "out" | "unknown";

export function stockStatus(p: CatalogProduct): { status: StockStatus; label: string } {
  if (p.inStock === false) return { status: "out", label: "Out of stock" };
  if (typeof p.stock === "number") {
    if (p.stock <= 0) return { status: "out", label: "Out of stock" };
    if (p.stock <= 5) return { status: "low", label: `Only ${p.stock} left` };
    return { status: "in", label: "In stock" };
  }
  if (p.inStock === true) return { status: "in", label: "In stock" };
  return { status: "unknown", label: "Availability on confirmation" };
}

export interface ShopFamily {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  keywords: string[];
}

/** Customer-facing fragrance families (nav + Attars menu). */
export const SHOP_FAMILIES: ShopFamily[] = [
  {
    slug: "musk",
    name: "Musk",
    tagline: "Tahara · White Musk",
    description: "Clean, powdery, close-to-skin musks for daily wear and layering.",
    keywords: ["musk", "tahara", "cashmere", "ambrette"],
  },
  {
    slug: "oud",
    name: "Oud",
    tagline: "Dehn al Oud · Hindi",
    description: "Deep agarwood oils — smoky Hindi profiles and honeyed blends.",
    keywords: ["oud", "oudh", "agarwood", "hindi", "cambodi", "dehn", "kalakasi"],
  },
  {
    slug: "floral",
    name: "Floral",
    tagline: "Rose · Jasmine",
    description: "Gulab, motia and white florals — romantic oils for day and evening.",
    keywords: ["rose", "gulab", "jasmine", "motia", "sambac", "tuberose", "floral", "peony", "orchid", "fleur"],
  },
  {
    slug: "fruity",
    name: "Fruity",
    tagline: "Berry · Apple · Citrus",
    description: "Juicy fruit-forward attars — lively, modern and easy to wear.",
    keywords: ["fruit", "fruity", "berry", "blueberry", "apple", "plum", "mango", "peach", "litchi", "lychee", "melon", "grape", "fawakeh"],
  },
  {
    slug: "woody",
    name: "Woody",
    tagline: "Sandal · Cedar",
    description: "Creamy sandalwood, cedar and sacred woods — grounding and calm.",
    keywords: ["wood", "woody", "sandal", "chandan", "mysore", "cedar", "santal", "khus", "vetiver", "orris"],
  },
  {
    slug: "sweet",
    name: "Sweet",
    tagline: "Vanilla · Chocolate",
    description: "Gourmand attars — chocolate, vanilla, praline and warm sweetness.",
    keywords: ["sweet", "vanilla", "chocolate", "cacao", "cocoa", "caramel", "honey", "praline", "tonka", "gourmand", "kunafa", "marshmallow"],
  },
  {
    slug: "fresh",
    name: "Fresh",
    tagline: "Citrus · Aquatic",
    description: "Bright citrus, aquatic and green attars for heat and daytime.",
    keywords: ["fresh", "citrus", "bergamot", "aquatic", "marine", "green", "mint", "lemon", "neroli", "ocean", "rain"],
  },
  {
    slug: "oriental",
    name: "Oriental",
    tagline: "Amber · Spice · Resin",
    description: "Warm amber, spice and resin blends — evening and winter richness.",
    keywords: ["oriental", "amber", "anbar", "spice", "spicy", "saffron", "resin", "myrrh", "frankincense", "benzoin", "labdanum", "balsam", "ambergris", "amberwood"],
  },
  {
    slug: "traditional",
    name: "Traditional Attars",
    tagline: "Kannauj Heritage",
    description: "Classic Indian attars — shamama, kesar-chandan, mitti and kewda.",
    keywords: ["traditional", "shamama", "kesar", "zafran", "kannauj", "mitti", "kevda", "kewda", "heena", "henna", "mehendi", "gil", "kasturi", "firdaus", "sandaliyah"],
  },
];

/** Primary brands in display order. Others appear dynamically under “Other brands”. */
export const PRIMARY_BRANDS = ["Al-Nuaim", "Al-Rehab", "Adil Qadri"] as const;

const norm = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map((t) => String(t ?? "").toLowerCase());
  if (typeof v === "string") return [v.toLowerCase()];
  return [];
};

function tagValue(tags: string[], key: string): string | null {
  const hit = tags.find((t) => t.startsWith(`${key}:`));
  return hit ? hit.slice(key.length + 1).trim() || null : null;
}

function haystack(p: CatalogProduct): string {
  const mats = Array.isArray(p.materials) ? p.materials.join(" ") : (p.materials ?? "");
  const tags = Array.isArray(p.tags) ? p.tags.join(" ") : "";
  return `${p.name ?? ""} ${p.category ?? ""} ${mats} ${tags} ${p.shortDescription ?? ""} ${p.dimensions ?? ""}`.toLowerCase();
}

/** Explicit `brand:` tag wins; otherwise match a known brand in tags/name. Null = unbranded (never invented). */
export function getBrand(p: CatalogProduct, knownBrands: string[] = []): string | null {
  if (p.brand && p.brand.trim()) return p.brand.trim();
  const tags = norm(p.tags);
  const rawTags = Array.isArray(p.tags) ? p.tags : [];
  const explicit = tagValue(tags, "brand");
  if (explicit) {
    const original = rawTags.find((t) => t.toLowerCase().startsWith("brand:"))!;
    return original.slice(6).trim() || explicit;
  }
  const hay = `${tags.join(" ")} ${(p.name ?? "").toLowerCase()}`;
  const candidates = [...PRIMARY_BRANDS, ...knownBrands];
  for (const b of candidates) {
    if (hay.includes(b.toLowerCase())) return b;
  }
  return null;
}

const AUDIENCE_WORDS: Record<Audience, RegExp[]> = {
  him: [/\bfor\s+him\b/, /\bfor\s+men\b/, /\bgents?\b/, /\bfor\s+him\b/],
  her: [/\bfor\s+her\b/, /\bfor\s+women\b/, /\bladies\b/, /\bfor\s+her\b/],
  unisex: [/\bunisex\b/],
};

export function getAudiences(p: CatalogProduct): Audience[] {
  const tags = norm(p.tags);
  const out = new Set<Audience>();
  const explicit = tagValue(tags, "gender") ?? tagValue(tags, "audience");
  if (explicit === "for-him" || explicit === "him") out.add("him");
  if (explicit === "for-her" || explicit === "her") out.add("her");
  if (explicit === "unisex" || explicit === "all") out.add("unisex");
  for (const t of tags) {
    if (t === "for-him" || t === "him") out.add("him");
    if (t === "for-her" || t === "her") out.add("her");
    if (t === "unisex") out.add("unisex");
  }
  const hay = haystack(p);
  (Object.keys(AUDIENCE_WORDS) as Audience[]).forEach((a) => {
    if (AUDIENCE_WORDS[a].some((re) => re.test(hay))) out.add(a);
  });
  // Attar-house convention: an oil without a stated audience is worn by all.
  if (out.size === 0) out.add("unisex");
  return [...out];
}

export function getKind(p: CatalogProduct): Kind {
  const tags = norm(p.tags);
  const explicit = tagValue(tags, "type") ?? tagValue(tags, "kind");
  if (explicit === "perfume" || explicit === "spray" || explicit === "edp") return "perfume";
  if (explicit === "attar" || explicit === "oil" || explicit === "mukhallat") return "attar";
  if (tags.includes("perfume") || tags.includes("spray") || tags.includes("edp")) return "perfume";
  if (tags.includes("attar") || tags.includes("oil") || tags.includes("mukhallat")) return "attar";
  const hay = haystack(p);
  // NOTE: "perfume oil" / "perfume oils" is attar-house wording for concentrated
  // oils (e.g. the default "Concentrated Perfume Oil (Alcohol-Free)" concentration),
  // so it must NOT count as a perfume signal — otherwise every attar resolves
  // to kind "perfume" and attar shelves go empty.
  if (/(spray|edp|eau de parfum|\bparfum\b|perfume(?!\s+oils?\b)|atomizer)/.test(hay)) return "perfume";
  if (/(attar|roll[\s-]?on|mukhallat|\boil\b)/.test(hay)) return "attar";
  return "attar";
}

export function resolveFamily(p: CatalogProduct): ShopFamily {
  const tags = norm(p.tags);
  const explicit = tagValue(tags, "family");
  if (explicit) {
    const hit = SHOP_FAMILIES.find((f) => f.slug === explicit);
    if (hit) return hit;
  }
  const hay = haystack(p);
  let best = SHOP_FAMILIES[0];
  let bestScore = -1;
  for (const f of SHOP_FAMILIES) {
    let score = 0;
    for (const k of f.keywords) if (hay.includes(k)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return best;
}

/** Canonical badge spelling: ignore spaces/hyphens/underscores so that
 *  "Best Seller", "best-seller", "New Arrival" etc. all resolve correctly. */
function canonBadgeWord(s: string): string {
  return s.trim().toLowerCase().replace(/[\s_\-]+/g, "");
}

function badgeFromWord(word: string): Badge | null {
  const c = canonBadgeWord(word);
  if (c === "bestseller" || c === "bestselling") return "bestseller";
  if (c === "new" || c === "newarrival" || c === "newarrivals") return "new";
  if (c === "combo" || c === "combos" || c === "combodeal" || c === "combodeals") return "combo";
  if (c === "offer" || c === "offers" || c === "sale" || c === "discount" || c === "deal") return "offer";
  if (c === "favourite" || c === "favorite" || c === "favourites" || c === "favorites") return "favourite";
  return null;
}

export function getBadges(p: CatalogProduct): Badge[] {
  const tags = norm(p.tags);
  const out = new Set<Badge>();
  const explicit = tagValue(tags, "badge");
  if (explicit) {
    explicit.split(/[,/]/).map((s) => s.trim()).forEach((s) => {
      const b = badgeFromWord(s);
      if (b) out.add(b);
    });
  }
  for (const t of tags) {
    const b = badgeFromWord(t);
    if (b) out.add(b);
  }
  const hay = haystack(p);
  if (/\bcombo\b/.test(hay)) out.add("combo");
  return [...out];
}

export function isDiscounted(p: CatalogProduct): boolean {
  return (
    getBadges(p).includes("offer") ||
    (p.compareAtPrice != null && p.price != null && Number(p.compareAtPrice) > Number(p.price))
  );
}

export function isBestseller(p: CatalogProduct): boolean {
  // Strictly badge-driven: only products explicitly tagged badge:bestseller
  // (e.g. via the Shelves pills in /admin → Catalog) appear on bestseller
  // shelves. The `featured` flag is a separate admin marker (server featured
  // feed, nav fallback) and must NOT leak products into bestsellers.
  return getBadges(p).includes("bestseller");
}

export function isNew(p: CatalogProduct): boolean {
  return getBadges(p).includes("new");
}

export function isCombo(p: CatalogProduct): boolean {
  return getBadges(p).includes("combo");
}

export function discountPercent(p: CatalogProduct): number {
  if (p.compareAtPrice == null || p.price == null) return 0;
  const mrp = Number(p.compareAtPrice);
  const price = Number(p.price);
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export interface ShopQuery {
  audience?: Audience | "all";
  kind?: Kind | "all";
  family?: string;
  brand?: string;
  category?: string;
  origin?: string;
  badge?: Badge | "all";
  preset?: "bestsellers" | "new" | "combos" | "offers" | "favourites" | "discounted" | "";
  search?: string;
  sort?: "new" | "price-asc" | "price-desc" | "rating" | "discount" | "";
}

export function parseShopQuery(search: string): ShopQuery {
  const q = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const one = (k: string) => q.get(k)?.trim() || undefined;
  return {
    audience: (one("audience") as ShopQuery["audience"]) ?? "all",
    kind: (one("kind") as ShopQuery["kind"]) ?? "all",
    family: one("family") ?? "all",
    brand: one("brand") ?? "all",
    category: one("category") ?? "all",
    origin: one("origin") ?? "all",
    badge: (one("badge") as ShopQuery["badge"]) ?? "all",
    preset: (one("preset") as ShopQuery["preset"]) ?? "",
    search: one("search") ?? "",
    sort: (one("sort") as ShopQuery["sort"]) ?? "",
  };
}

export function buildShopHref(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v !== "all" && v !== "") q.set(k, v);
  }
  const s = q.toString();
  return s ? `/shop?${s}` : "/shop";
}

export function filterCatalog(products: CatalogProduct[], query: ShopQuery): CatalogProduct[] {
  let list = products.filter((p) => !(p as { referenceDraft?: boolean }).referenceDraft);

  if (query.audience && query.audience !== "all") {
    const aud = query.audience as Audience;
    list = list.filter((p) => {
      const a = getAudiences(p);
      if (a.includes(aud)) return true;
      // Attar-house convention: unisex oils are wearable by all, so they
      // appear in For Him and For Her shelves as well as Unisex.
      if ((aud === "him" || aud === "her") && a.includes("unisex")) return true;
      return false;
    });
  }
  if (query.kind && query.kind !== "all") {
    list = list.filter((p) => getKind(p) === query.kind);
  }
  if (query.family && query.family !== "all") {
    list = list.filter((p) => resolveFamily(p).slug === query.family);
  }
  if (query.brand && query.brand !== "all") {
    if (query.brand === "other") {
      list = list.filter((p) => getBrand(p) === null);
    } else {
      list = list.filter((p) => {
        const b = getBrand(p);
        return b ? b.toLowerCase() === query.brand!.toLowerCase() : query.brand!.toLowerCase() === "ayesha" && /ayesha/i.test(p.name);
      });
    }
  }
  if (query.category && query.category !== "all") {
    const c = query.category.toLowerCase();
    list = list.filter((p) => (p.category ?? "").toLowerCase().includes(c) || c.includes((p.category ?? "").toLowerCase()));
  }
  if (query.origin && query.origin !== "all") {
    list = list.filter((p) => deriveOrigin(p).origin.slug === query.origin);
  }
  if (query.badge && query.badge !== "all") {
    if (query.badge === "offer") {
      list = list.filter((p) => isDiscounted(p));
    } else {
      list = list.filter((p) => getBadges(p).includes(query.badge as Badge));
    }
  }
  if (query.preset === "bestsellers") {
    list = list.filter((p) => isBestseller(p));
  } else if (query.preset === "new") {
    const flagged = list.filter((p) => isNew(p));
    list = flagged.length > 0 ? flagged : [...list].sort(byNew).slice(0, 12);
  } else if (query.preset === "combos") {
    list = list.filter((p) => isCombo(p));
  } else if (query.preset === "offers" || query.preset === "discounted") {
    list = list.filter((p) => isDiscounted(p));
  } else if (query.preset === "favourites") {
    list = [...list].sort(byRating).slice(0, 12);
  }

  if (query.search && query.search.trim()) {
    const s = query.search.trim().toLowerCase();
    list = list.filter((p) => {
      const brand = (getBrand(p) ?? "").toLowerCase();
      const family = resolveFamily(p);
      const hay = [
        p.name,
        brand,
        family.name,
        p.category ?? "",
        p.shortDescription ?? "",
        p.description ?? "",
        Array.isArray(p.tags) ? p.tags.join(" ") : "",
        Array.isArray(p.materials) ? p.materials.join(" ") : (p.materials ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return s.split(/\s+/).every((word) => hay.includes(word));
    });
  }

  if (query.sort === "price-asc") list = [...list].sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
  else if (query.sort === "price-desc") list = [...list].sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
  else if (query.sort === "rating") list = [...list].sort(byRating);
  else if (query.sort === "discount") list = [...list].sort((a, b) => discountPercent(b) - discountPercent(a));
  else if (query.sort === "new") list = [...list].sort(byNew);

  return list;
}

function byNew(a: CatalogProduct, b: CatalogProduct): number {
  const an = isNew(a) ? 1 : 0;
  const bn = isNew(b) ? 1 : 0;
  if (an !== bn) return bn - an;
  const at = a.createdAt ? Date.parse(a.createdAt) : 0;
  const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
  return bt - at;
}

function byRating(a: CatalogProduct, b: CatalogProduct): number {
  const score = (p: CatalogProduct) => Number(p.rating ?? 0) * 100 + Number(p.reviewCount ?? 0);
  return score(b) - score(a);
}

export interface CatalogSearchHit {
  type: "product" | "brand" | "family" | "collection";
  label: string;
  detail: string;
  href: string;
  product?: CatalogProduct;
}

export function searchCatalog(
  products: CatalogProduct[],
  collections: { name: string; slug: string }[],
  raw: string,
  limit = 6
): CatalogSearchHit[] {
  const s = raw.trim().toLowerCase();
  if (!s) return [];
  const hits: CatalogSearchHit[] = [];

  const brands = brandsPresent(products);
  for (const b of brands) {
    if (b.toLowerCase().includes(s)) {
      hits.push({ type: "brand", label: b, detail: "Brand", href: buildShopHref({ brand: b }) });
    }
  }
  for (const f of SHOP_FAMILIES) {
    if (f.name.toLowerCase().includes(s) || f.slug.includes(s.replace(/\s+/g, ""))) {
      hits.push({ type: "family", label: `${f.name} Attars`, detail: "Fragrance family", href: buildShopHref({ kind: "attar", family: f.slug }) });
    }
  }
  for (const c of collections) {
    if (c.name.toLowerCase().includes(s)) {
      hits.push({ type: "collection", label: c.name, detail: "Collection", href: `/collections/${c.slug}` });
    }
  }
  const words = s.split(/\s+/);
  for (const p of products) {
    if (hits.filter((h) => h.type === "product").length >= limit) break;
    const brand = (getBrand(p) ?? "").toLowerCase();
    const family = resolveFamily(p);
    const hay = [p.name, brand, family.name, p.category ?? "", Array.isArray(p.tags) ? p.tags.join(" ") : ""].join(" ").toLowerCase();
    if (words.every((w) => hay.includes(w))) {
      hits.push({
        type: "product",
        label: p.name,
        detail: `${brand || "Attar"} · Rs. ${Number(p.price ?? 0).toLocaleString()}`,
        href: `/product/${p.slug || p.id}`,
        product: p,
      });
    }
  }
  return hits.slice(0, limit + 6);
}

/** Brands present in live products only — never from drafts or hardcoded lists. */
export function brandsPresent(products: CatalogProduct[]): string[] {
  const seen = new Map<string, string>();
  for (const p of products) {
    if ((p as { referenceDraft?: boolean }).referenceDraft) continue;
    const b = getBrand(p);
    if (b && !seen.has(b.toLowerCase())) seen.set(b.toLowerCase(), b);
  }
  const ordered: string[] = [];
  for (const fixed of PRIMARY_BRANDS) {
    const hit = [...seen.values()].find((v) => v.toLowerCase() === fixed.toLowerCase());
    if (hit) ordered.push(hit);
  }
  for (const v of seen.values()) {
    if (!ordered.some((o) => o.toLowerCase() === v.toLowerCase())) ordered.push(v);
  }
  return ordered;
}

export function hasUnbranded(products: CatalogProduct[]): boolean {
  return products.some((p) => !(p as { referenceDraft?: boolean }).referenceDraft && getBrand(p) === null);
}

export function familiesPresent(products: CatalogProduct[]): ShopFamily[] {
  const slugs = new Set(products.filter((p) => !(p as { referenceDraft?: boolean }).referenceDraft).map((p) => resolveFamily(p).slug));
  return SHOP_FAMILIES.filter((f) => slugs.has(f.slug));
}

export function countBy<T extends string>(products: CatalogProduct[], key: (p: CatalogProduct) => T[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of products) {
    for (const k of key(p)) out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/** Live API products only (limit-bounded). Drafts/fallbacks never enter nav, search or home sections. */
export function useCatalogProducts(limit = 100) {
  const query = useListProducts(
    { limit },
    { query: { queryKey: ["catalog-products", limit], staleTime: 60_000 } }
  );
  const products = useMemo<CatalogProduct[]>(() => {
    const list = (query.data as { products?: unknown } | undefined)?.products;
    if (!Array.isArray(list)) return [];
    return list as unknown as CatalogProduct[];
  }, [query.data]);
  return { ...query, products };
}

export const AUDIENCE_LABEL: Record<Audience, string> = { him: "For Him", her: "For Her", unisex: "Unisex" };
