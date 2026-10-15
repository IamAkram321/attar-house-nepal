import { motion } from "framer-motion";
import { Link } from "wouter";
import { SHOP_FAMILIES, useCatalogProducts, filterCatalog, buildShopHref } from "@/lib/catalog";
import { ArrowUpRight } from "lucide-react";

export function FamilyGrid() {
  const { products } = useCatalogProducts(100);
  const counts = Object.fromEntries(
    SHOP_FAMILIES.map((f) => [f.slug, filterCatalog(products, { kind: "attar", family: f.slug }).length])
  );

  return (
    <section className="relative bg-ivory py-20 text-neutral-900 md:py-28">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-pine">Shop by family</p>
            <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Nine attar families, <span className="italic text-pine">one ritual.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-neutral-600 md:text-base">
              Only families present in the live catalogue are shown. Pick one to filter attars instantly.
            </p>
          </div>
          <Link href={buildShopHref({ kind: "attar" })} className="font-mono text-xs uppercase tracking-widest text-pine underline">
            View all attars
          </Link>
        </div>

        {SHOP_FAMILIES.every((f) => (counts[f.slug] ?? 0) === 0) ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 px-5 py-10 text-center text-sm text-neutral-500">
            Family shelves are being stocked — new attars appear here automatically once added in admin.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SHOP_FAMILIES.filter((f) => (counts[f.slug] ?? 0) > 0).map((f, i) => (
              <motion.div
                key={f.slug}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              >
                <Link
                  href={buildShopHref({ kind: "attar", family: f.slug })}
                  className="group block rounded-xl border border-coal/10 bg-white/90 p-6 shadow-2xs transition-all hover:border-brass/60 hover:shadow-lg"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    {counts[f.slug]} {counts[f.slug] === 1 ? "attar" : "attars"}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl tracking-tight group-hover:text-pine">{f.name}</h3>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-pine">{f.tagline}</p>
                  <p className="mt-3 line-clamp-3 text-[13px] font-light leading-relaxed text-neutral-600">{f.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-800 group-hover:text-pine">
                    Shop {f.name} <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
