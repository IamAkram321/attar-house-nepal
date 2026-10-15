import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { Search, SlidersHorizontal, Sparkles, RotateCcw, X, Filter, Check, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductCard, type Product } from "@/components/product/ProductCard";
import {
  SHOP_FAMILIES,
  parseShopQuery,
  filterCatalog,
  buildShopHref,
  useCatalogProducts,
  brandsPresent,
  hasUnbranded,
  type Audience,
  type Kind,
  type CatalogProduct,
} from "@/lib/catalog";
import { ATTAR_ORIGINS } from "@/lib/attar-taxonomy";
import { ATTAR_REFERENCE_DRAFTS } from "@/lib/attar-reference-catalog";
import { useAttarSEO, shopSEOFor, breadcrumbJsonLd, NOINDEX } from "@/lib/attar-seo";
import { VerificationNote } from "@/components/attar/VerificationNote";

// Luxury fallback fragrance collection for Attar House Nepal
export const FALLBACK_PERFUMES: Product[] = [
  {
    id: 1,
    name: "Oud Royale Extrait",
    slug: "oud-royale-extrait",
    price: 18500,
    compareAtPrice: 22000,
    category: "Extrait de Parfum",
    materials: [
      "Top: Calabrian Bergamot, Pink Peppercorn",
      "Heart: Bulgarian Rose, Moroccan Jasmine",
      "Base: 25-Year Royal Cambodian Oud, Smoked Amber, Bourbon Vanilla"
    ],
    colors: ["50ml / 1.7 fl.oz", "100ml / 3.4 fl.oz", "200ml / 6.8 fl.oz"],
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200"
    ],
    shortDescription: "A hypnotic, regal blend of pure aged Cambodian agarwood, royal Damask rose, and golden amber.",
    featured: true
  },
  {
    id: 2,
    name: "Rose Impériale de Grasse",
    slug: "rose-imperiale-de-grasse",
    price: 16000,
    compareAtPrice: 19500,
    category: "Floral & Botanical",
    materials: [
      "Top: Green Dew, Italian Mandarin, Lychee",
      "Heart: Hand-Harvested Rose Centifolia, Rose Damascena",
      "Base: White Cashmere Musk, Haitian Vetiver, Cedarwood"
    ],
    colors: ["50ml / 1.7 fl.oz", "100ml / 3.4 fl.oz"],
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200"
    ],
    shortDescription: "Dawn-harvested May roses from Grasse steeped in velvety white musk and crisp Italian citrus.",
    featured: true
  },
  {
    id: 3,
    name: "Santal Blanc & Cashmere",
    slug: "santal-blanc-and-cashmere",
    price: 15500,
    compareAtPrice: 18000,
    category: "Eau de Parfum",
    materials: [
      "Top: Cardamom Pods, White Violet, Crisp Papyrus",
      "Heart: Tuscan Orris Butter, Cedar Atlas",
      "Base: Mysore Sandalwood, Creamy Amber, Soft Leather"
    ],
    colors: ["50ml / 1.7 fl.oz", "100ml / 3.4 fl.oz"],
    images: [
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1200"
    ],
    shortDescription: "A creamy, sophisticated veil of pure Mysore sandalwood and velvety orris butter.",
    featured: true
  },
  {
    id: 4,
    name: "Velvet Amber Noir",
    slug: "velvet-amber-noir",
    price: 17200,
    compareAtPrice: 20500,
    category: "Oud & Orientals",
    materials: [
      "Top: Golden Saffron, Cinnamon Bark, Bitter Orange",
      "Heart: Smoked Labdanum, Benzoin Resin, Cacao",
      "Base: Black Amber, Tonka Bean, Aged Bourbon Vanilla"
    ],
    colors: ["50ml / 1.7 fl.oz", "100ml / 3.4 fl.oz"],
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200"
    ],
    shortDescription: "Warm, intoxicating resins wrapped in saffron threads and rich Madagascar bourbon vanilla.",
    featured: true
  },
  {
    id: 5,
    name: "Soleil de Neroli",
    slug: "soleil-de-neroli",
    price: 14800,
    compareAtPrice: null,
    category: "Fresh & Citrus",
    materials: [
      "Top: Sun-Drenched Neroli, Calabrian Bergamot, Petitgrain",
      "Heart: Orange Blossom Absolute, White Jasmine",
      "Base: Sunlit Amber, Cedarwood, Salty Marine Accord"
    ],
    colors: ["50ml / 1.7 fl.oz", "100ml / 3.4 fl.oz"],
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1200"
    ],
    shortDescription: "Luminous Mediterranean neroli blossoms and sparkling bergamot warmed by golden sunshine.",
    featured: false
  },
  {
    id: 6,
    name: "Fleur Nocturne Extrait",
    slug: "fleur-nocturne-extrait",
    price: 19500,
    compareAtPrice: 24000,
    category: "Extrait de Parfum",
    materials: [
      "Top: Black Plum, Pink Pepper, Davana",
      "Heart: Night-Blooming Tuberose, Ylang Ylang Extra, Jasmine Sambac",
      "Base: Smoked Patchouli, Dark Oud, Ambergris"
    ],
    colors: ["50ml / 1.7 fl.oz", "100ml / 3.4 fl.oz"],
    images: [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200"
    ],
    shortDescription: "An enigmatic nocturnal potion of white tuberose, dark plum, and smoldering Indonesian patchouli.",
    featured: true
  },
  {
    id: 7,
    name: "Cuir Sublime",
    slug: "cuir-sublime",
    price: 16800,
    compareAtPrice: null,
    category: "Oud & Orientals",
    materials: [
      "Top: Thyme, Raspberry, Saffron Accord",
      "Heart: Florentine Orris, Frankincense tears, Jasmine",
      "Base: Black Suede, Amberwood, Birch Tar, Musk"
    ],
    colors: ["50ml / 1.7 fl.oz", "100ml / 3.4 fl.oz"],
    images: [
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200"
    ],
    shortDescription: "A seductive dialogue between supple leather, wild raspberry, and golden frankincense.",
    featured: false
  },
  {
    id: 8,
    name: "The Discovery Coffret (5 x 10ml)",
    slug: "the-discovery-coffret",
    price: 8500,
    compareAtPrice: 11000,
    category: "Private Reserve",
    materials: [
      "Top: Curated Selection of Signature Top Notes",
      "Heart: Rose de Grasse, Santal Blanc, Amber Noir",
      "Base: Oud Royale, Soleil Neroli, Fleur Nocturne"
    ],
    colors: ["5 x 10ml Travel Flacons"],
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200"
    ],
    shortDescription: "A luxury discovery wardrobe containing five of our most celebrated extraits in gold-capped travel flacons.",
    featured: true
  }
];

export default function ShopPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeFamily, setActiveFamily] = useState<string>("all");
  const [activeOrigin, setActiveOrigin] = useState<string>("all");
  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [activeAudience, setActiveAudience] = useState<Audience | "all">("all");
  const [activeKind, setActiveKind] = useState<Kind | "all">("all");
  const [activeBadge, setActiveBadge] = useState<string>("all");
  const [activePreset, setActivePreset] = useState<string>("");
  const [activeSort, setActiveSort] = useState<string>("");
  const [showDrafts, setShowDrafts] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Single source of truth: the URL query (?audience=him&kind=attar&family=musk…).
  // Every nav link, mega menu and search lands here; pills navigate (back-button safe).
  useEffect(() => {
    try {
      const q = parseShopQuery(searchString);
      setActiveAudience(q.audience ?? "all");
      setActiveKind(q.kind ?? "all");
      setActiveFamily(q.family ?? "all");
      setActiveBrand(q.brand ?? "all");
      setActiveOrigin(q.origin ?? "all");
      setActiveCategory(q.category ?? "all");
      setActiveBadge(q.badge ?? "all");
      setActivePreset(q.preset ?? "");
      setActiveSort(q.sort ?? "");
      setSearch(q.search ?? "");
    } catch {
      /* ignore */
    }
  }, [searchString]);

  const go = (patch: Record<string, string | undefined>) => {
    navigate(
      buildShopHref({
        audience: activeAudience,
        kind: activeKind,
        family: activeFamily,
        brand: activeBrand,
        origin: activeOrigin,
        category: activeCategory,
        badge: activeBadge,
        preset: activePreset,
        sort: activeSort,
        search: search || undefined,
        ...patch,
      })
    );
  };

  const { data: categoriesData } = useListCategories({
    query: { queryKey: ["categories"] },
  });

  // Broad live-catalog fetch; all discovery filters apply client-side so
  // brand / family / audience / badge links never miss catalogue items.
  const { products: apiProducts, isLoading } = useCatalogProducts(100);

  // If backend returns products, use them; otherwise use fallback + editable reference drafts.
  // While the first fetch is still in flight, render skeletons (never flash
  // fallback products and then swap them once the API resolves).
  const catalogLoading = isLoading && apiProducts.length === 0;
  const baseCatalog: Product[] = useMemo(() => {
    if (apiProducts.length > 0) return apiProducts as unknown as Product[];
    if (isLoading) return [];
    const local: Product[] = [...FALLBACK_PERFUMES, ...ATTAR_REFERENCE_DRAFTS];
    return showDrafts ? local : local.filter((p) => !(p as unknown as { referenceDraft?: boolean }).referenceDraft);
  }, [apiProducts, isLoading, showDrafts]);

  // Filter products by audience, kind, brand, category, family, origin, search, badges and notes
  const filteredProducts = useMemo(() => {
    const filtered = filterCatalog(baseCatalog as unknown as CatalogProduct[], {
      audience: activeAudience,
      kind: activeKind,
      family: activeFamily,
      brand: activeBrand,
      origin: activeOrigin,
      category: activeCategory,
      badge: activeBadge as any,
      preset: activePreset as any,
      search: search.trim() ? search.trim() : undefined,
      sort: activeSort as any,
    });
    if (selectedNotes.length === 0) return filtered;
    return filtered.filter((p) => {
      const allNotesStr = Array.isArray(p.materials) ? (p.materials as string[]).join(" ").toLowerCase() : "";
      return selectedNotes.some((note) => allNotesStr.includes(note.toLowerCase()));
    });
  }, [baseCatalog, activeAudience, activeKind, activeFamily, activeBrand, activeOrigin, activeCategory, activeBadge, activePreset, activeSort, search, selectedNotes]);

  const liveBrands = useMemo(() => brandsPresent(apiProducts as unknown as CatalogProduct[]), [apiProducts]);
  const hasOtherBrands = useMemo(
    () => hasUnbranded(apiProducts as unknown as CatalogProduct[]),
    [apiProducts]
  );

  const apiCategoryNames: string[] = Array.isArray((categoriesData as unknown as { categories?: Array<string | { name?: string; slug?: string }> })?.categories)
    ? (categoriesData as unknown as { categories: Array<string | { name?: string; slug?: string }> }).categories
        .map((c) => (typeof c === "string" ? c : c.name ?? c.slug ?? ""))
        .filter(Boolean)
    : [];
  const categories = apiCategoryNames.length > 0
    ? ["all", ...apiCategoryNames]
    : [
        "all",
        "Floral Attars",
        "Oud & Hindi Oud",
        "Musk Attars",
        "Woody & Sacred Woods",
        "Amber & Resins",
        "Herbal & Earthy",
        "Traditional Indian Attars",
        "Mukhallat & Oriental Blends",
        "Attar Oils",
        "Oriental Sprays",
      ];

  const olfactoryAccords = ["Oud", "Rose", "Amber", "Vanilla", "Sandalwood", "Bergamot", "Jasmine", "Saffron", "Musk", "Chocolate", "Dates", "Praline"];

  const handleNoteToggle = (note: string) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const activeFiltersCount =
    (activeCategory !== "all" ? 1 : 0) +
    (activeFamily !== "all" ? 1 : 0) +
    (activeOrigin !== "all" ? 1 : 0) +
    (activeBrand !== "all" ? 1 : 0) +
    (activeAudience !== "all" ? 1 : 0) +
    (activeKind !== "all" ? 1 : 0) +
    (activeBadge !== "all" ? 1 : 0) +
    (activePreset ? 1 : 0) +
    selectedNotes.length +
    (search ? 1 : 0);

  // Unique SEO title + description + H1 per listing state (spec §5).
  const seo = useMemo(() => {
    const fam = SHOP_FAMILIES.find((f) => f.slug === activeFamily);
    return shopSEOFor({
      audience: activeAudience,
      kind: activeKind,
      family: activeFamily,
      familyName: fam?.name,
      brand: activeBrand,
      preset: activePreset,
    });
  }, [activeAudience, activeKind, activeFamily, activeBrand, activePreset]);

  useAttarSEO(seo.title, seo.desc, {
    canonical: buildShopHref({
      audience: activeAudience,
      kind: activeKind,
      family: activeFamily,
      brand: activeBrand,
      preset: activePreset,
    }),
    // Never index internal search-result URLs.
    robots: search.trim() ? NOINDEX : undefined,
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        {
          name: seo.h1,
          path: buildShopHref({
            audience: activeAudience,
            kind: activeKind,
            family: activeFamily,
            brand: activeBrand,
            preset: activePreset,
          }),
        },
      ]),
    ],
  });

  const resetAll = () => {
    setSelectedNotes([]);
    navigate("/shop");
  };

  // Compact applied-filter chips (single row) — replaces the five stacked pill rows.
  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (activeAudience !== "all") {
    const label = activeAudience === "him" ? "For Him" : activeAudience === "her" ? "For Her" : "Unisex";
    activeChips.push({ key: "audience", label, clear: () => go({ audience: undefined }) });
  }
  if (activeKind !== "all") {
    activeChips.push({ key: "kind", label: activeKind === "attar" ? "Attars" : "Perfumes", clear: () => go({ kind: undefined }) });
  }
  if (activeFamily !== "all") {
    const fam = SHOP_FAMILIES.find((f) => f.slug === activeFamily);
    activeChips.push({ key: "family", label: fam ? fam.name : activeFamily, clear: () => go({ family: undefined }) });
  }
  if (activeOrigin !== "all") {
    const origin = ATTAR_ORIGINS.find((o) => o.slug === activeOrigin);
    activeChips.push({ key: "origin", label: origin ? origin.name : activeOrigin, clear: () => go({ origin: undefined }) });
  }
  if (activeBrand !== "all") {
    activeChips.push({ key: "brand", label: activeBrand === "other" ? "Other brands" : activeBrand, clear: () => go({ brand: undefined }) });
  }
  if (activeCategory !== "all") {
    activeChips.push({ key: "category", label: activeCategory, clear: () => go({ category: undefined }) });
  }
  if (activePreset) {
    activeChips.push({ key: "preset", label: activePreset, clear: () => go({ preset: undefined }) });
  }
  if (activeBadge !== "all") {
    activeChips.push({ key: "badge", label: activeBadge, clear: () => go({ badge: undefined }) });
  }
  if (search.trim()) {
    activeChips.push({ key: "search", label: `“${search.trim()}”`, clear: () => { setSearch(""); go({ search: undefined }); } });
  }
  for (const note of selectedNotes) {
    activeChips.push({ key: `note-${note}`, label: note, clear: () => handleNoteToggle(note) });
  }

  const rowClass = (active: boolean) =>
    `w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors cursor-pointer ${
      active ? "bg-pine text-ivory font-semibold" : "text-coal/75 hover:bg-sand/60 hover:text-pine"
    }`;

  const renderRow = (active: boolean, onClick: () => void, label: string, count?: number, key?: string) => (
    <button key={key ?? label} onClick={onClick} aria-pressed={active} className={rowClass(active)}>
      <span
        className={`flex items-center justify-center w-4 h-4 rounded-full border shrink-0 ${
          active ? "border-ivory bg-ivory text-pine" : "border-coal/25 text-transparent"
        }`}
        aria-hidden
      >
        <Check className="w-3 h-3" />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {count != null && (
        <span className={`text-[11px] tabular-nums ${active ? "text-ivory/80" : "text-coal/40"}`}>{count}</span>
      )}
    </button>
  );

  const sectionClass = "border-b border-coal/10 py-4 last:border-0";
  const summaryClass =
    "flex items-center justify-between w-full text-[11px] font-semibold uppercase tracking-[0.16em] text-coal/60 cursor-pointer list-none [&::-webkit-details-marker]:hidden";

  const renderFilterSections = () => {
    return (
      <div>
        <details className={sectionClass} open>
          <summary className={summaryClass}>
            Shop for <ChevronDown className="w-3.5 h-3.5" />
          </summary>
          <div className="mt-3 space-y-1">
            {[
              { slug: "all", name: "Everyone" },
              { slug: "him", name: "For Him" },
              { slug: "her", name: "For Her" },
              { slug: "unisex", name: "Unisex" },
            ].map((a) =>
              renderRow(activeAudience === a.slug, () => go({ audience: a.slug === "all" ? undefined : a.slug }), a.name)
            )}
          </div>
        </details>

        <details className={sectionClass} open>
          <summary className={summaryClass}>
            Type <ChevronDown className="w-3.5 h-3.5" />
          </summary>
          <div className="mt-3 space-y-1">
            {[
              { slug: "all", name: "All types" },
              { slug: "attar", name: "Attars" },
              { slug: "perfume", name: "Perfumes" },
            ].map((t) =>
              renderRow(activeKind === t.slug, () => go({ kind: t.slug === "all" ? undefined : t.slug }), t.name)
            )}
          </div>
        </details>

        <details className={sectionClass} open={activeFamily !== "all"}>
          <summary className={summaryClass}>
            Family <ChevronDown className="w-3.5 h-3.5" />
          </summary>
          <div className="mt-3 space-y-1">
            {renderRow(activeFamily === "all", () => go({ family: undefined }), "All families")}
            {SHOP_FAMILIES.map((f) =>
              renderRow(
                activeFamily === f.slug,
                () => go({ family: f.slug === activeFamily ? undefined : f.slug }),
                f.name,
                undefined,
                f.slug
              )
            )}
          </div>
        </details>

        <details className={sectionClass} open={activeBrand !== "all"}>
          <summary className={summaryClass}>
            Brand <ChevronDown className="w-3.5 h-3.5" />
          </summary>
          <div className="mt-3 space-y-1">
            {renderRow(activeBrand === "all", () => go({ brand: undefined }), "All brands")}
            {liveBrands.map((b) =>
              renderRow(
                activeBrand === b,
                () => go({ brand: b === activeBrand ? undefined : b }),
                b,
                undefined,
                b
              )
            )}
            {hasOtherBrands &&
              renderRow(activeBrand === "other", () => go({ brand: activeBrand === "other" ? undefined : "other" }), "Other brands")}
          </div>
        </details>

        <details className={sectionClass} open={activeOrigin !== "all"}>
          <summary className={summaryClass}>
            Origin <ChevronDown className="w-3.5 h-3.5" />
          </summary>
          <div className="mt-3 space-y-1">
            {renderRow(activeOrigin === "all", () => go({ origin: undefined }), "All origins")}
            {ATTAR_ORIGINS.map((o) =>
              renderRow(
                activeOrigin === o.slug,
                () => go({ origin: o.slug === activeOrigin ? undefined : o.slug }),
                (o as { name: string }).name,
                undefined,
                o.slug
              )
            )}
          </div>
        </details>

        <details className={sectionClass} open={activeCategory !== "all"}>
          <summary className={summaryClass}>
            Category <ChevronDown className="w-3.5 h-3.5" />
          </summary>
          <div className="mt-3 space-y-1">
            {categories.map((category) =>
              renderRow(
                activeCategory === category,
                () => go({ category: category === "all" ? undefined : category }),
                category === "all" ? "All categories" : category,
                undefined,
                category
              )
            )}
          </div>
        </details>

        <details className={sectionClass} open={selectedNotes.length > 0}>
          <summary className={summaryClass}>
            Notes {selectedNotes.length > 0 ? `(${selectedNotes.length})` : ""} <ChevronDown className="w-3.5 h-3.5" />
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {olfactoryAccords.map((note) => {
              const selected = selectedNotes.includes(note);
              return (
                <button
                  key={note}
                  onClick={() => handleNoteToggle(note)}
                  aria-pressed={selected}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    selected
                      ? "border-pine bg-pine text-ivory"
                      : "border-coal/15 bg-white text-coal/70 hover:border-pine/50 hover:text-pine"
                  }`}
                >
                  {note}
                </button>
              );
            })}
          </div>
          {selectedNotes.length > 0 && (
            <button
              onClick={() => setSelectedNotes([])}
              className="mt-2 text-[11px] text-coal/50 hover:text-pine underline cursor-pointer"
            >
              Clear notes
            </button>
          )}
        </details>

        {apiProducts.length === 0 && (
          <div className="py-4">
            <button
              onClick={() => setShowDrafts((v) => !v)}
              className="text-[11px] font-medium uppercase tracking-[0.14em] text-coal/50 hover:text-pine cursor-pointer"
              title="Reference drafts are editable placeholders"
            >
              {showDrafts ? "Drafts: shown" : "Drafts: hidden"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative pt-36 lg:pt-40 pb-24 bg-ivory text-coal min-h-screen overflow-hidden selection:bg-brass/20 selection:text-pine">
      
      {/* Background Lighting & Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#B79A62_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]" />
        <div className="absolute -right-20 top-1/4 w-[600px] h-[600px] rounded-full bg-brass/10 blur-[140px]" />
        <div className="absolute -left-20 bottom-10 w-[500px] h-[500px] rounded-full bg-sand/60 blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 max-w-7xl">
        
        {/* Page Header & Search Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 pb-6 border-b border-neutral-300/80 gap-6">
          <div>
            <div className="flex items-center gap-2 text-pine font-mono text-xs uppercase tracking-widest mb-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brass-deep" />
              <span>Attars · Musk · Oud · Floral · Amber</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-normal text-neutral-900 tracking-tight">
              {seo.h1}
            </h1>
            <p className="mt-2 text-neutral-600 font-light text-sm md:text-base max-w-xl leading-relaxed">
              Concentrated attar oils, mukhallat blends, and oriental sprays — floral, oud, musk, woody, amber, and herbal traditions. Origins and notes shown as currently listed; verification in progress.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") go({});
                }}
                placeholder="Search attars, brands, families…"
                aria-label="Search the catalogue"
                className="w-full bg-white/90 backdrop-blur-md border border-neutral-300/80 rounded-2xl pl-10 pr-8 py-3 text-xs font-mono placeholder:text-neutral-400 focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/20 transition-all shadow-2xs"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    go({ search: undefined });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters Button (mobile — opens the left drawer) */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-neutral-300/80 bg-white/90 text-neutral-700 text-xs font-mono uppercase tracking-wider transition-all shadow-2xs cursor-pointer hover:border-neutral-400"
            >
              <SlidersHorizontal className="w-4 h-4 text-brass-deep" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-pine text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <VerificationNote compact />
        </div>

        {/* Filters live in the left sidebar on desktop and a drawer on mobile — see below. */}

        {/* Attar family, origin, brand and category filters live in the sidebar now. */}

        {/* Applied filters — one compact removable row */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.clear}
                className="inline-flex items-center gap-1.5 rounded-full bg-pine px-3 py-1.5 text-[11px] font-medium text-ivory hover:bg-pine-deep transition-colors cursor-pointer"
              >
                {chip.label}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-coal/15 px-3 py-1.5 text-[11px] font-medium text-coal/60 hover:text-pine hover:border-pine/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8 items-start">
          {/* Left sidebar — desktop */}
          <aside className="hidden lg:block sticky top-40 rounded-2xl border border-coal/10 bg-white px-5 py-2 shadow-[0_1px_2px_rgba(35,38,36,0.06)] max-h-[calc(100vh-11rem)] overflow-y-auto">
            <div className="flex items-center justify-between pt-4 pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-coal">
                Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAll}
                  className="text-[11px] font-medium text-coal/50 hover:text-pine underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
            {renderFilterSections()}
          </aside>

          {/* Product column */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3 mb-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-coal/50">
                {filteredProducts.length} {filteredProducts.length === 1 ? "attar" : "attars"}
                {activePreset ? ` · ${activePreset}` : ""}
              </p>
              <label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-coal/50">
                Sort
                <select
                  value={activeSort}
                  onChange={(e) => go({ sort: e.target.value || undefined })}
                  className="rounded-xl border border-coal/15 bg-white px-3 py-2 text-xs normal-case tracking-normal text-coal focus:outline-none focus:border-pine"
                >
                  <option value="">Featured</option>
                  <option value="new">Newest</option>
                  <option value="price-asc">Price · low to high</option>
                  <option value="price-desc">Price · high to low</option>
                  <option value="rating">Top rated</option>
                  <option value="discount">Biggest saving</option>
                </select>
              </label>
            </div>

        {/* Product Grid Area */}
        <div className="w-full">
          {catalogLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8" aria-label="Loading products">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] w-full rounded-xl bg-beige animate-pulse" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-beige animate-pulse" />
                  <div className="mt-2 h-4 w-1/3 rounded bg-beige animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${activeFamily}-${activeOrigin}-${activeBrand}-${activeAudience}-${activeKind}-${activeBadge}-${activePreset}-${activeSort}-${search}-${selectedNotes.join("-")}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8"
              >
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product as unknown as Product} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 text-center rounded-3xl border border-neutral-300/80 bg-white/90 backdrop-blur-md shadow-2xs max-w-lg mx-auto"
            >
              <Filter className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                {apiProducts.length === 0 ? "The shelves are being stocked" : "No attars found"}
              </h3>
              <p className="text-neutral-500 font-light text-xs max-w-xs mx-auto mb-6">
                {apiProducts.length === 0
                  ? "No live products in the catalogue yet. New attars appear here automatically once added in admin."
                  : "No creations match this combination in the current catalog."}
              </p>
              <button
                onClick={() => {
                  setSelectedNotes([]);
                  navigate("/shop");
                }}
                className="btn-primary shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </motion.div>
          )}
        </div>
          </div>
        </div>

        {/* Mobile filter drawer — same sections as the sidebar */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-[320px] overflow-y-auto">
            <SheetHeader className="text-left">
              <SheetTitle>Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}</SheetTitle>
            </SheetHeader>
            <div className="mt-2 pb-4">{renderFilterSections()}</div>
            <SheetFooter className="flex-row gap-2 sm:justify-between border-t border-coal/10 pt-4">
              <Button variant="outline" onClick={resetAll} className="flex-1">
                Clear all
              </Button>
              <Button onClick={() => setDrawerOpen(false)} className="flex-1">
                Show {filteredProducts.length} {filteredProducts.length === 1 ? "attar" : "attars"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}