import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListCollections } from "@workspace/api-client-react";
import { ArrowUpRight, Compass, Sparkles, Search, Droplets, MapPin } from "lucide-react";
import { ATTAR_ORIGINS } from "@/lib/attar-taxonomy";
import { useAttarSEO, ATTAR_SEO, breadcrumbJsonLd } from "@/lib/attar-seo";
import { VerificationNote } from "@/components/attar/VerificationNote";

export interface LuxuryCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export const FALLBACK_COLLECTIONS: LuxuryCollection[] = [
  {
    id: "col-1",
    name: "The Noir Reserve",
    slug: "the-noir-reserve",
    description: "Opulent, nocturnal extraits blending smoky Cambodian agarwood, charred resins, dark roasted vanilla, and aged labdanum.",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1600&q=85",
    productCount: 3,
  },
  {
    id: "col-2",
    name: "The Sovereign Florals of Grasse",
    slug: "the-sovereign-florals",
    description: "Sublime botanical symphonies composed with hand-picked May Rose, luminous Jasmine Sambac, and velvety tuberose.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85",
    productCount: 3,
  },
  {
    id: "col-3",
    name: "The Amber & Oriental Archives",
    slug: "amber-oriental-archives",
    description: "Intimate and sensual creations radiating warmth, golden fossilized amber, rare spices, and velvety tonka bean.",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
    productCount: 2,
  },
  {
    id: "col-4",
    name: "The Luminary Botanicals",
    slug: "the-luminary-botanicals",
    description: "Bright, sun-drenched extractions featuring sparkling Calabrian bergamot, orange blossom, and crisp aromatic sage.",
    image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1600&q=85",
    productCount: 2,
  },
];

export default function CollectionsPage() {
  useAttarSEO(ATTAR_SEO.collections.title, ATTAR_SEO.collections.desc, {
    canonical: "/collections",
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Collections", path: "/collections" },
      ]),
    ],
  });
  const { data: collections, isLoading } = useListCollections({
    query: { queryKey: ["collections"] },
  });

  const [searchQuery, setSearchQuery] = useState("");

  const rawCollections = useMemo(() => {
    if (Array.isArray(collections) && collections.length > 0) {
      return collections;
    }
    return FALLBACK_COLLECTIONS;
  }, [collections]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return rawCollections;
    return rawCollections.filter(
      (col) =>
        col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rawCollections, searchQuery]);

  return (
    <div className="relative pt-36 md:pt-40 pb-24 md:pb-32 bg-ivory text-neutral-900 min-h-screen overflow-hidden selection:bg-brass/20 selection:text-neutral-900">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#B79A62_0.6px,transparent_0.6px)] [background-size:28px_28px] opacity-15" />
        <div className="absolute -right-20 top-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brass/15 via-transparent to-transparent blur-[120px]" />
        <div className="absolute left-10 bottom-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-brass/10 via-brass/5 to-transparent blur-[130px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-7xl">
        
        {/* Header Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 border-b border-neutral-200 pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-brass/10 border border-brass/30 font-mono text-[10px] uppercase tracking-[0.25em] text-brass-deep mb-3">
              <Sparkles className="w-3 h-3 text-brass" />
              <span>Olfactory Anthologies</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-neutral-950 tracking-tight leading-tight">
              Curated Attar <br />
              <span className="italic font-light text-brass-deep">Origins</span>
            </h1>
            
            <p className="mt-4 text-neutral-600 text-sm md:text-base font-light leading-relaxed">
              Hindi heritage, Arabian classic, and Dubai modern oriental stories — plus our curated collection shelves below.
              Origin stories are general heritage education; per-product origins need owner confirmation.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections or accords..."
                className="w-full pl-11 pr-4 py-3 bg-white/90 backdrop-blur-2xl border border-neutral-200 rounded-full text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brass transition-all duration-300 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Origin stories: Indian / Saudi / Dubai (general heritage, functional links to shop) */}
        <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {ATTAR_ORIGINS.slice(0, 3).map((o) => (
            <Link key={o.slug} href={`/shop?origin=${o.slug}`} className="group block rounded-xl border border-pine/20 bg-pine-deep p-6 text-ivory transition-all hover:border-brass/60">
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brass">
                <MapPin className="h-3 w-3" /> {o.region}
              </p>
              <h3 className="mt-2 font-serif text-2xl">{o.name}</h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-neutral-400">{o.tagline}</p>
              <p className="mt-3 line-clamp-3 text-[13px] font-light leading-relaxed text-neutral-300">{o.story}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-brass">
                Shop this origin <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mb-10">
          <VerificationNote compact />
        </div>

        <h2 className="mb-6 font-serif text-2xl tracking-tight">Curated collections</h2>

        {/* Loading Skeleton Grid */}
        {isLoading && !filteredCollections.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 aspect-[16/10] w-full"
              />
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-2xl shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-brass/10 border border-brass/20 flex items-center justify-center mx-auto mb-4 text-brass-deep">
              <Droplets className="h-6 w-6 text-brass" />
            </div>
            <h3 className="font-serif text-2xl font-normal text-neutral-900 mb-2">
              No Collections Found
            </h3>
            <p className="text-neutral-500 text-xs font-mono uppercase tracking-wider max-w-sm mx-auto">
              {searchQuery
                ? "No fragrance collection matches your query."
                : "Check back soon for new seasonal anthologies."}
            </p>
          </motion.div>
        ) : (

          /* Collections Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCollections.map((col, index) => {
              const isWide = index % 3 === 0;
              const cardColSpan = isWide ? "col-span-1 md:col-span-2" : "col-span-1";
              const cardAspect = isWide
                ? "aspect-[16/9] md:aspect-[21/9]"
                : "aspect-[4/3] md:aspect-[16/10]";

              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.slug}`}
                  className={`group block ${cardColSpan}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 shadow-md transition-all duration-500 group-hover:border-brass/60 group-hover:shadow-2xl ${cardAspect}`}
                  >
                    {col.image ? (
                      <img
                        src={col.image}
                        alt={col.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 filter contrast-[1.03] brightness-[0.85]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                        <Droplets className="h-10 w-10 text-neutral-700" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/15 opacity-85 group-hover:opacity-90 transition-opacity duration-500" />

                    <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/80 border border-white/15 backdrop-blur-md font-mono text-[9px] text-brass tracking-widest uppercase">
                        <Compass className="w-2.5 h-2.5 text-brass" />
                        {col.productCount} {col.productCount === 1 ? "Flacon" : "Flacons"}
                      </span>

                      <span className="font-mono text-[10px] text-white/50 tracking-widest uppercase">
                        ANTHOLOGY / 0{index + 1}
                      </span>
                    </div>

                    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-20">
                      <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <div className="flex items-end justify-between gap-4 mb-2">
                          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal tracking-tight group-hover:text-[#F3E7D3] transition-colors duration-300">
                            {col.name}
                          </h2>

                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:bg-brass group-hover:border-brass text-white transition-all duration-300 transform group-hover:scale-105 shrink-0 shadow-sm">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>

                        {col.description && (
                          <p className="text-neutral-300 font-light text-xs sm:text-sm leading-relaxed max-w-2xl opacity-85 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                            {col.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}