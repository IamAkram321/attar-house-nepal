import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, Award, Search } from "lucide-react";
import { useState } from "react";
import { useCatalogProducts, brandsPresent, hasUnbranded, buildShopHref, filterCatalog } from "@/lib/catalog";
import { useAttarSEO, ATTAR_SEO, breadcrumbJsonLd } from "@/lib/attar-seo";

export default function BrandsPage() {
  useAttarSEO(ATTAR_SEO.brands.title, ATTAR_SEO.brands.desc, {
    canonical: "/brands",
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Explore Fragrance Brands", path: "/brands" },
      ]),
    ],
  });
  const { products, isLoading } = useCatalogProducts(100);
  const [query, setQuery] = useState("");
  const brands = brandsPresent(products);
  const others = hasUnbranded(products);
  const visible = brands.filter((b) => b.toLowerCase().includes(query.trim().toLowerCase()));

  const countFor = (brand: string) =>
    filterCatalog(products, { brand }).length;

  return (
    <div className="pt-12 pb-24 bg-background text-foreground min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-foreground mb-2">Brand shelves</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Explore Fragrance Brands</h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base font-light text-neutral-600 leading-relaxed">
          Established attar houses stocked by Attar House Nepal — browse Al-Nuaim, Al-Rehab,
          Adil Qadri and more fragrance brands.
        </p>

        <div className="relative mt-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a brand…"
            aria-label="Find a brand"
            className="w-full bg-white/90 border border-neutral-300/80 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-pine focus:ring-2 focus:ring-pine/20"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-neutral-200/70 h-44" />
            ))}
          </div>
        ) : visible.length === 0 && !others ? (
          <div className="mt-10 py-16 text-center rounded-xl border border-neutral-300/80 bg-white/90 max-w-lg mx-auto">
            <Award className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <h2 className="font-serif text-2xl mb-1">Brand shelves opening soon</h2>
            <p className="text-neutral-500 text-sm font-light max-w-xs mx-auto">
              No branded products in the live catalogue yet. Al-Nuaim, Al-Rehab and Adil Qadri shelves appear here once stocked.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {visible.map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
              >
                <Link
                  href={buildShopHref({ brand })}
                  className="group block rounded-xl bg-pine text-ivory p-7 hover:bg-pine-deep transition-colors"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass">
                    {countFor(brand)} {countFor(brand) === 1 ? "attar" : "attars"}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl tracking-tight">{brand}</h2>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-[#E9D9B8] group-hover:text-white">
                    Shop {brand} <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
            {others && (
              <Link
                href={buildShopHref({ brand: "other" })}
                className="group block rounded-xl border border-[#2B1D16]/15 bg-white/90 p-7 hover:border-[#C5A265]/60 transition-colors"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  {filterCatalog(products, { brand: "other" }).length} attars
                </p>
                <h2 className="mt-2 font-serif text-3xl tracking-tight">Other brands</h2>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-pine">
                  Browse shelf <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
