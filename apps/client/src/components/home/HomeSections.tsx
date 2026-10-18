import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useListTestimonials } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { cloudinarySrc } from "@/lib/attar-images";
import { useHomepageSection } from "@/lib/homepage-sections";
import {
  SHOP_FAMILIES,
  buildShopHref,
  filterCatalog,
  brandsPresent,
  countBy,
  getBadges,
  getBrand,
  isBestseller,
  isDiscounted,
  isNew,
  resolveFamily,
  useCatalogProducts,
  type CatalogProduct,
} from "@/lib/catalog";

function SectionHead({
  eyebrow,
  title,
  copy,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div className="max-w-xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-coal">{title}</h2>
        {copy && <p className="mt-2 text-sm sm:text-base text-coal/60 leading-relaxed">{copy}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-pine hover:text-pine-deep shrink-0"
        >
          {cta ?? "View all"} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

function ProductRow({
  filter,
  empty,
}: {
  filter: (list: CatalogProduct[]) => CatalogProduct[];
  empty: string;
}) {
  const { products, isLoading } = useCatalogProducts(100);
  const list = filter(products as unknown as CatalogProduct[]).slice(0, 8);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-lg bg-beige animate-pulse" />
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return <p className="text-sm text-coal/55 card-flat p-6">{empty}</p>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {list.map((p, i) => (
        <ProductCard key={String(p.id)} product={p as any} index={i} />
      ))}
    </div>
  );
}

export function BestsellingAttars() {
  return (
    <section className="section-pad py-8 sm:py-10">
      <SectionHead
        eyebrow="Bestsellers"
        title="Most loved attars"
        copy="The oils our customers reach for again and again."
        href={buildShopHref({ preset: "bestsellers" })}
      />
      <ProductRow
        filter={(list) => filterCatalog(list, { preset: "bestsellers" })}
        empty="New favourites are being chosen right now — explore the full attar shelf meanwhile."
      />
    </section>
  );
}

export function ShopByBrand() {
  const { products } = useCatalogProducts(100);
  const list = products as unknown as CatalogProduct[];
  const brands = brandsPresent(list);
  const counts = countBy(list, (p) => {
    const b = getBrand(p);
    return b ? [b] : [];
  });

  if (brands.length === 0) return null;

  return (
    <section className="section-pad py-14 sm:py-16">
      <SectionHead
        eyebrow="Imported attar houses"
        title="Shop by brand"
        copy="Great houses of attar, from heritage Kannauj to modern Dubai."
        href="/brands"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {brands.map((b) => (
          <Link
            key={b}
            href={buildShopHref({ brand: b })}
            className="card-flat p-6 flex flex-col gap-1"
          >
            <span className="text-base font-semibold text-coal">{b}</span>
            <span className="text-xs text-coal/50">{counts[b] ?? 0} products</span>
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-pine">
              Shop {b} <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ExploreByFamily() {
  const { products } = useCatalogProducts(100);
  const list = products as unknown as CatalogProduct[];
  const present = new Set(list.map((p) => resolveFamily(p).slug));
  const families = SHOP_FAMILIES.filter((f) => present.has(f.slug));
  const shown = families.length > 0 ? families : SHOP_FAMILIES.slice(0, 8);

  return (
    <section className="border-y border-line">
      <div className="section-pad py-14 sm:py-16">
        <SectionHead
          eyebrow="Fragrance families"
          title="Explore by family"
          copy="Follow musk's softness, oud's depth or rose's romance to the oil that feels like you."
          href={buildShopHref({ kind: "attar" })}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {shown.map((f) => {
            const n = list.filter((p) => resolveFamily(p).slug === f.slug).length;
            return (
              <Link
                key={f.slug}
                href={buildShopHref({ kind: "attar", family: f.slug })}
                className="rounded-lg border border-coal/10 bg-white p-5 hover:border-pine/40 transition-colors"
              >
                <span className="text-sm font-semibold text-coal">{f.name}</span>
                <span className="block mt-0.5 text-xs text-coal/50">{f.tagline}</span>
                <span className="block mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-brass-deep">
                  {n} products
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function NewArrivals() {
  return (
    <section className="section-pad py-14 sm:py-16">
      <SectionHead
        eyebrow="New arrivals"
        title="Just landed"
        href={buildShopHref({ preset: "new" })}
      />
      <ProductRow
        filter={(list) =>
          filterCatalog(list, { preset: "new" }).length > 0
            ? filterCatalog(list, { preset: "new" })
            : [...list].slice(0, 8)
        }
        empty="Fresh arrivals are on their way — browse the collection meanwhile."
      />
    </section>
  );
}

export function OffersAndCombos() {
  const { products } = useCatalogProducts(100);
  const list = products as unknown as CatalogProduct[];
  const offers = filterCatalog(list, { preset: "offers" }).slice(0, 4);
  const combos = filterCatalog(list, { preset: "combos" }).slice(0, 4);
  const hasAny = offers.length + combos.length > 0;
  void isDiscounted;
  void isNew;
  void isBestseller;
  void getBadges;

  return (
    <section className="section-pad pb-14 sm:pb-16">
      <SectionHead
        eyebrow="Offers"
        title="Special offers and combo deals"
        copy="Genuine savings on gift sets and selected oils, while they last."
        href="/offers"
      />
      {!hasAny ? (
        <p className="text-sm text-coal/55 card-flat p-6">
          No offers at this moment — beautiful things are worth full price. Check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...combos, ...offers].slice(0, 8).map((p, i) => (
            <ProductCard key={String(p.id)} product={p as any} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

export function CraftPreview() {
  const { section, isPending } = useHomepageSection("why-attar");

  if (isPending) {
    return (
      <section className="section-pad pb-14 sm:pb-16" aria-label="Loading">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <div className="card-flat p-8 sm:p-10">
            <div className="h-3 w-32 rounded bg-beige animate-pulse" />
            <div className="mt-4 h-8 w-4/5 rounded bg-beige animate-pulse" />
            <div className="mt-3 h-4 w-full rounded bg-beige animate-pulse" />
            <div className="mt-2 h-4 w-2/3 rounded bg-beige animate-pulse" />
          </div>
          <div className="rounded-lg bg-beige animate-pulse min-h-[280px]" />
        </div>
      </section>
    );
  }

  if (!section || section.isActive === false) return null;

  return (
    <section className="section-pad pb-14 sm:pb-16">
      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        <div className="card-flat p-8 sm:p-10 flex flex-col justify-center">
          {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            {section.title}
          </h2>
          {section.description && (
            <p className="mt-3 text-sm sm:text-base text-coal/60 leading-relaxed">
              {section.description}
            </p>
          )}
          {(section.primaryCtaLabel || section.secondaryCtaLabel) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {section.primaryCtaLabel && section.primaryCtaHref && (
                <Link href={section.primaryCtaHref} className="btn-primary">
                  {section.primaryCtaLabel}
                </Link>
              )}
              {section.secondaryCtaLabel && section.secondaryCtaHref && (
                <Link href={section.secondaryCtaHref} className="btn-outline">
                  {section.secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
        {section.image && (
          <div className="relative overflow-hidden rounded-lg border border-coal/10">
            <img
              src={cloudinarySrc(section.image, 1200)}
              alt={section.title}
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {(section.overlayTitle || section.overlaySubtitle) && (
              <div className="absolute inset-x-0 bottom-0 bg-pine-ink/85 px-6 py-4">
                {section.overlayTitle && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory">
                    {section.overlayTitle}
                  </p>
                )}
                {section.overlaySubtitle && (
                  <p className="mt-0.5 text-xs text-ivory/70">
                    {section.overlaySubtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function TrustSection() {
  const { data } = useListTestimonials({ query: { queryKey: ["testimonials"] } });
  const testimonials = Array.isArray(data) ? data.slice(0, 3) : [];

  return (
    <section className="bg-pine text-ivory">
      <div className="section-pad py-14 sm:py-16">
        <p className="eyebrow eyebrow-light">Importer &amp; retailer</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Authentic imports, shelved with care
        </h2>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/70 leading-relaxed">
          Attar House Nepal is a Nepal-based importer and retailer of established attar houses
          including Al-Nuaim, Al-Rehab and Adil Qadri. We do not manufacture attars. Catalogue
          details are shown as listed by our suppliers.
        </p>

        {testimonials.length > 0 ? (
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {testimonials.map((t: any) => (
              <figure key={t.id} className="rounded-lg bg-white/5 border border-white/10 p-6">
                <blockquote className="text-sm text-white/85 leading-relaxed">“{t.text}”</blockquote>
                <figcaption className="mt-4 text-xs uppercase tracking-[0.14em] text-white/60">
                  {t.name}
                  {t.productPurchased ? ` · ${t.productPurchased}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-3 gap-4 text-sm">
            {[
              ["Attars first", "Oils are the primary business; sprays are secondary."],
              ["Verified shelves", "Brand, family and gender come from admin-managed tags."],
              ["Kathmandu based", "Imported attar houses, shelved in Nepal."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg bg-white/5 border border-white/10 p-6">
                <p className="font-semibold text-white">{t}</p>
                <p className="mt-1 text-white/65">{d}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}