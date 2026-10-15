import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  useCatalogProducts,
  filterCatalog,
  buildShopHref,
  brandsPresent,
  AUDIENCE_LABEL,
  type Audience,
} from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";

function SectionHead({
  eyebrow,
  title,
  blurb,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: React.ReactNode;
  blurb: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-pine">{eyebrow}</p>
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-neutral-600">{blurb}</p>
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-pine underline">
        {linkLabel} <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function ProductRail({ items, empty }: { items: Parameters<typeof filterCatalog>[0]; empty: string }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 px-5 py-10 text-center text-sm text-neutral-500">
        {empty}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
      {items.slice(0, 4).map((p, i) => (
        <ProductCard key={p.id} product={p as any} index={i} />
      ))}
    </div>
  );
}

const AUDIENCES: { key: Audience; blurb: string }[] = [
  { key: "him", blurb: "Bold ouds, woods and evening orientals." },
  { key: "her", blurb: "Florals, musks and luminous day attars." },
  { key: "unisex", blurb: "Worn by all — the heart of attar tradition." },
];

export function AudienceShowcase() {
  const { products } = useCatalogProducts(100);
  return (
    <section className="bg-ivory py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <SectionHead
          eyebrow="Shop by who wears it"
          title={<>Attars for Him, for Her, <span className="italic text-pine">for Everyone.</span></>}
          blurb="Attar oils are traditionally shared — these shelves simply help you start."
          href={buildShopHref({})}
          linkLabel="Shop all"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {AUDIENCES.map((a, i) => {
            const count = filterCatalog(products, { audience: a.key }).length;
            return (
              <motion.div
                key={a.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <Link
                  href={buildShopHref({ audience: a.key })}
                  className="group block rounded-xl bg-pine p-7 text-[#FAF6EF] hover:bg-pine-deep transition-colors"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass">
                    {count} {count === 1 ? "attar" : "attars"}
                  </p>
                  <h3 className="mt-2 font-serif text-3xl">{AUDIENCE_LABEL[a.key]}</h3>
                  <p className="mt-2 text-sm font-light text-neutral-300">{a.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-ivory group-hover:text-white">
                    Shop {AUDIENCE_LABEL[a.key]} <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PopularAttars() {
  const { products } = useCatalogProducts(100);
  const items = filterCatalog(products, { preset: "bestsellers", kind: "attar" });
  const fallback = items.length > 0 ? items : filterCatalog(products, { kind: "attar" });
  return (
    <section className="bg-ivory py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <SectionHead
          eyebrow="Most loved"
          title={<>Popular <span className="italic text-pine">Attars.</span></>}
          blurb="Bestseller-tagged attars from the live catalogue — marked by the shop, not by us."
          href={buildShopHref({ kind: "attar", preset: "bestsellers" })}
          linkLabel="All popular attars"
        />
        <ProductRail items={fallback} empty="No popular attars yet — bestsellers appear here once tagged in admin." />
      </div>
    </section>
  );
}

export function BrandShowcase() {
  const { products } = useCatalogProducts(100);
  const brands = brandsPresent(products);
  if (brands.length === 0) return null;
  return (
    <section className="bg-pine-deep py-16 text-[#FAF6EF] md:py-20">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <SectionHead
          eyebrow="Established houses"
          title={<>Explore by <span className="italic text-brass-light">Brand.</span></>}
          blurb="Imported attar houses on our shelves — each shelf opens only when stocked."
          href="/brands"
          linkLabel="All brands"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brands.slice(0, 4).map((b) => {
            const count = filterCatalog(products, { brand: b }).length;
            return (
              <Link key={b} href={buildShopHref({ brand: b })} className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:border-brass/50 transition-colors">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass">
                  {count} {count === 1 ? "attar" : "attars"}
                </p>
                <h3 className="mt-2 font-serif text-2xl">{b}</h3>
                <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-neutral-300 group-hover:text-white">
                  Shop {b} <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function NewAndLoved() {
  const { products } = useCatalogProducts(100);
  const fresh = filterCatalog(products, { preset: "new" });
  const loved = filterCatalog(products, { preset: "favourites" });
  return (
    <section className="bg-ivory py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-16">
        <div>
          <SectionHead
            eyebrow="Just landed"
            title={<>New <span className="italic text-pine">Arrivals.</span></>}
            blurb="The latest additions to the live catalogue."
            href={buildShopHref({ preset: "new" })}
            linkLabel="All new arrivals"
          />
          <ProductRail items={fresh} empty="Nothing new this week — fresh stock appears here automatically." />
        </div>
        <div>
          <SectionHead
            eyebrow="Rated by wearers"
            title={<>Customer <span className="italic text-pine">Favourites.</span></>}
            blurb="Top-rated attars from verified catalogue reviews."
            href={buildShopHref({ preset: "favourites" })}
            linkLabel="All favourites"
          />
          <ProductRail items={loved} empty="No rated favourites yet — reviews from your orders will build this shelf." />
        </div>
      </div>
    </section>
  );
}

export function ComboSpotlight() {
  const { products } = useCatalogProducts(100);
  const items = filterCatalog(products, { kind: "attar", preset: "combos" });
  return (
    <section className="bg-pine py-16 text-[#FAF6EF] md:py-20">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <SectionHead
          eyebrow="Sets & savings"
          title={<>Attar <span className="italic text-brass-light">Combos.</span></>}
          blurb="Multi-flacon sets for gifting and discovery."
          href={buildShopHref({ kind: "attar", preset: "combos" })}
          linkLabel="All combos"
        />
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/20 px-5 py-10 text-center text-sm text-neutral-300">
            No combo sets in the catalogue yet — bundle products appear here once tagged “combo” in admin.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {items.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function PerfumeStrip() {
  const { products } = useCatalogProducts(100);
  const items = filterCatalog(products, { kind: "perfume" });
  if (items.length === 0) return null;
  return (
    <section className="bg-ivory py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <SectionHead
          eyebrow="Secondary shelf"
          title={<>Perfumes, <span className="italic text-pine">where relevant.</span></>}
          blurb="Sprays from the same houses — attars remain the heart of the shop."
          href={buildShopHref({ kind: "perfume" })}
          linkLabel="All perfumes"
        />
        <ProductRail items={items} empty="" />
      </div>
    </section>
  );
}
