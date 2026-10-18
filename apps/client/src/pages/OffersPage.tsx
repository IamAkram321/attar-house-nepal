import { Link } from "wouter";
import { ArrowUpRight, BadgePercent, Gift, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { useCatalogProducts, filterCatalog, buildShopHref } from "@/lib/catalog";
import { useAttarSEO, ATTAR_SEO, breadcrumbJsonLd } from "@/lib/attar-seo";

function Rail({
  title,
  blurb,
  href,
  items,
  empty,
}: {
  title: string;
  blurb: string;
  href: string;
  items: Parameters<typeof filterCatalog>[0];
  empty: string;
}) {
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-3xl tracking-tight">{title}</h2>
          <p className="mt-1 text-sm font-light text-neutral-600">{blurb}</p>
        </div>
        <Link href={href} className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-pine underline shrink-0">
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 px-5 py-8 text-center text-sm text-neutral-500">
          {empty}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {items.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p as any} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function OffersPage() {
  useAttarSEO(ATTAR_SEO.offers.title, ATTAR_SEO.offers.desc, {
    canonical: "/offers",
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Explore Fragrance Offers", path: "/offers" },
      ]),
    ],
  });
  const { products } = useCatalogProducts(100);
  const specials = filterCatalog(products, { preset: "offers" });
  const combos = filterCatalog(products, { kind: "attar", preset: "combos" });
  const discounted = filterCatalog(products, { preset: "discounted" });

  return (
    <div className="pt-12 pb-24 bg-background text-foreground min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-foreground mb-2">Save on attars</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Explore Fragrance Offers</h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base font-light text-neutral-600 leading-relaxed">
          Combo deals and marked-down attars at Attar House Nepal. Discounts show against each product&apos;s own listed price.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Sparkles, t: "Special Offers", d: "Curated offer shelf", href: buildShopHref({ preset: "offers" }) },
            { icon: Gift, t: "Attar Combo Deals", d: "Multi-flacon sets", href: buildShopHref({ kind: "attar", preset: "combos" }) },
            { icon: BadgePercent, t: "Discounted Products", d: "Reduced from listed price", href: buildShopHref({ preset: "discounted" }) },
          ].map(({ icon: Icon, t, d, href }) => (
            <Link key={t} href={href} className="group rounded-xl bg-pine text-ivory p-6 hover:bg-pine-deep transition-colors">
              <Icon className="w-5 h-5 text-[#C5A265]" />
              <p className="mt-3 font-serif text-2xl">{t}</p>
              <p className="text-xs font-light text-neutral-300">{d}</p>
            </Link>
          ))}
        </div>

        <Rail
          title="Special Offers"
          blurb="Offer-tagged attars, curated by the shop."
          href={buildShopHref({ preset: "offers" })}
          items={specials}
          empty="No special offers right now — check back soon."
        />
        <Rail
          title="Attar Combo Deals"
          blurb="Sets and multi-flacon attar deals."
          href={buildShopHref({ kind: "attar", preset: "combos" })}
          items={combos}
          empty="No combo deals in the catalogue yet."
        />
        <Rail
          title="Discounted Products"
          blurb="Reduced from their listed prices."
          href={buildShopHref({ preset: "discounted" })}
          items={discounted}
          empty="Nothing discounted at the moment."
        />
      </div>
    </div>
  );
}
