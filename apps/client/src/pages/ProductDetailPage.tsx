import { useParams, Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ToastAction } from '@/components/ui/toast';
import { useGetProduct, useAddCartItem } from '@workspace/api-client-react';
import { useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence } from 'framer-motion';
import { ProductReviews } from '@/components/ui/ProductReviews';
import { AttarProductMeta } from '@/components/attar/AttarProductMeta';
import { VerificationNote } from '@/components/attar/VerificationNote';
import { deriveFamily, deriveOrigin } from '@/lib/attar-taxonomy';
import { 
  ShoppingBag, 
  Minus, 
  Plus, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  Check,
  Sparkles,
  Droplets,
  Clock,
  Compass
} from 'lucide-react';
import { FALLBACK_PERFUMES } from './ShopPage';
import { cloudinarySrc } from '@/lib/attar-images';
import { ATTAR_REFERENCE_DRAFTS } from '@/lib/attar-reference-catalog';
import { useAttarSEO, ATTAR_SEO, productJsonLd, breadcrumbJsonLd } from '@/lib/attar-seo';
import { getBrand, getKind, getAudiences, AUDIENCE_LABEL, buildShopHref, sizeOptions, priceForSize, startingPrice, stockStatus } from '@/lib/catalog';

interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

// Helper to parse notes from strings like "Top: Bergamot, Pink Pepper"
function parseNotes(materials?: string[] | string): FragranceNotes {
  const defaultNotes: FragranceNotes = {
    top: ["Calabrian Bergamot", "Pink Peppercorn", "Italian Mandarin"],
    heart: ["Damask Rose", "Moroccan Jasmine", "French Orris"],
    base: ["Royal Cambodian Oud", "Smoked Amber", "Bourbon Vanilla"]
  };

  if (!materials) return defaultNotes;

  const arr = Array.isArray(materials) ? materials : [materials];
  const parsed: FragranceNotes = { top: [], heart: [], base: [] };

  arr.forEach((line) => {
    const l = line.trim();
    if (/^top:/i.test(l)) {
      parsed.top = l.replace(/^top:\s*/i, '').split(',').map(s => s.trim());
    } else if (/^(heart|middle):/i.test(l)) {
      parsed.heart = l.replace(/^(heart|middle):\s*/i, '').split(',').map(s => s.trim());
    } else if (/^base:/i.test(l)) {
      parsed.base = l.replace(/^base:\s*/i, '').split(',').map(s => s.trim());
    } else {
      parsed.base.push(l);
    }
  });

  return {
    top: parsed.top.length ? parsed.top : defaultNotes.top,
    heart: parsed.heart.length ? parsed.heart : defaultNotes.heart,
    base: parsed.base.length ? parsed.base : defaultNotes.base,
  };
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const { data: apiProduct, isLoading, error: apiError } = useGetProduct(slug as unknown as number, {
    query: {
      queryKey: ['product', slug],
      enabled: !!slug,
      retry: false,
    },
  });

  // Backend truth: fallback/reference products (ids 1-8, 901+) do NOT exist in the
  // database until created in /admin. A 404 here means preview-only — cart will fail.
  const isBackendMissing = !isLoading && (!apiProduct || !!apiError);

  const { refreshCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const addCartItem = useAddCartItem();

  // Find fallback match if API is empty or loading (French catalog + editable reference drafts)
  const ALL_LOCAL: typeof FALLBACK_PERFUMES = [...FALLBACK_PERFUMES, ...ATTAR_REFERENCE_DRAFTS];
  const fallbackMatch = useMemo(() => {
    if (!slug) return FALLBACK_PERFUMES[0];
    const matchBySlug = ALL_LOCAL.find(p => p.slug === slug);
    if (matchBySlug) return matchBySlug;
    const matchById = ALL_LOCAL.find(p => String(p.id) === String(slug));
    if (matchById) return matchById;
    return FALLBACK_PERFUMES[0];
  }, [slug]);

  // Merge API product with fallback perfume details
  const displayProduct = useMemo(() => {
    if (apiProduct && apiProduct.id) {
      return {
        ...fallbackMatch,
        ...apiProduct,
        price: Number(apiProduct.price) || fallbackMatch.price || 16500,
        images: Array.isArray(apiProduct.images) && apiProduct.images.length > 0 ? apiProduct.images : fallbackMatch.images,
        materials: Array.isArray(apiProduct.materials) && apiProduct.materials.length > 0 ? apiProduct.materials : fallbackMatch.materials,
      };
    }
    return fallbackMatch;
  }, [apiProduct, fallbackMatch]);

  const sizes = (() => {
    return sizeOptions(displayProduct as any).map(({ label, price }) => {
      const isSpray = /50ml|100ml|200ml/i.test(label);
      const mult = label.includes('50ml') ? 0.75 : label.includes('200ml') ? 1.65 : 1.0;
      const tag = /6ml|3ml|5\.5ml/i.test(label) ? 'Attar Oil' : /9\.9ml|9ml|10ml|12ml|20ml/i.test(label) ? 'Attar Oil' : isSpray ? (label.includes('100ml') ? 'Signature' : 'Flacon') : 'As listed';
      return { label, price, multiplier: mult, tag };
    });
  })();

  const effectiveSize = selectedSize ?? sizes[0]?.label ?? '6ml';
  const selected = sizes.find(s => s.label === effectiveSize);
  // Admin-managed per-size price wins; otherwise the catalogue base price
  // (with legacy spray-size scaling for old fallback products only).
  const basePrice = Number(displayProduct.price) || 0;
  const currentPrice = selected?.price != null && selected.price > 0
    ? Math.round(selected.price)
    : Math.round(basePrice * (selected?.multiplier || 1.0));
  const hasPrice = currentPrice > 0;
  const stock = stockStatus(displayProduct as any);
  const outOfStock = stock.status === "out";
  const isDraft = (displayProduct as unknown as { referenceDraft?: boolean }).referenceDraft === true;
  const brand = getBrand(displayProduct as any) ?? (displayProduct as unknown as { brand?: string }).brand ?? null;
  const kind = getKind(displayProduct as any);
  const audiences = getAudiences(displayProduct as any);

  const images = (displayProduct.images && displayProduct.images.length > 0)
    ? displayProduct.images
    : ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200"];

  const seo = ATTAR_SEO.product(displayProduct.name ?? "Attar", brand);
  // Structured data from backend truth only — preview-only fallback products
  // must never emit invented prices or availability into JSON-LD.
  const hasBackendProduct = !isBackendMissing && apiProduct && (apiProduct as { id?: unknown }).id != null;
  useAttarSEO(seo.title, seo.desc, {
    canonical: `/product/${slug}`,
    ogType: "product",
    image: images[0],
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: kind === "attar" ? "Shop Premium Attars in Nepal" : "Explore Perfumes", path: buildShopHref({ kind }) },
        { name: displayProduct.name ?? "Attar", path: `/product/${slug}` },
      ]),
      ...(hasBackendProduct
        ? [
            productJsonLd({
              name: (apiProduct as { name: string }).name,
              brand,
              image: Array.isArray((apiProduct as { images?: unknown }).images)
                ? ((apiProduct as { images: string[] }).images[0] as string | undefined)
                : undefined,
              description:
                ((apiProduct as { shortDescription?: string }).shortDescription ||
                  (apiProduct as { description?: string }).description ||
                  undefined) as string | undefined,
              price: Number((apiProduct as { price: unknown }).price) || null,
              inStock: (apiProduct as { inStock?: boolean }).inStock !== false,
              urlPath: `/product/${slug}`,
            }),
          ]
        : []),
    ],
  });

  const notes = parseNotes(displayProduct.materials);

  const handleAddToCart = () => {
    if (!displayProduct || !hasPrice || outOfStock || isBackendMissing) return;

    const productId = typeof displayProduct.id === 'number' ? displayProduct.id : null;
    if (!productId) {
      toast({
        title: "Cannot add to bag",
        description: "This product is not available in the catalogue yet. Create it in /admin → Catalog first.",
        variant: "destructive",
      });
      return;
    }

    addCartItem.mutate(
      {
        data: {
          productId,
          quantity,
          material: effectiveSize,
          sizeLabel: effectiveSize,
          unitPrice: currentPrice,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Added to your fragrance bag',
            description: `${displayProduct.name} (${effectiveSize}) has been reserved.`,
            action: (
              <ToastAction altText="View shopping bag" onClick={() => navigate('/cart')}>
                View Bag
              </ToastAction>
            ),
          });
          queryClient.invalidateQueries({ queryKey: ['cart'] });
          refreshCart();
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "";
          const notFound = /404|not found/i.test(msg);
          toast({
            title: notFound ? "Not in backend catalog yet" : "Could not add to bag",
            description: notFound
              ? `${displayProduct.name} exists only as a frontend preview. Create it in /admin → Catalog (same slug), then try again.`
              : (msg || "Please try again."),
            variant: "destructive",
          });
          refreshCart();
        },
      }
    );
  };

  // First paint: neutral skeleton while the product loads — never flash the
  // local fallback content and then swap it once the API resolves.
  if (isLoading) {
    return (
      <div className="pt-12 pb-20 bg-background text-foreground min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 h-4 w-64 rounded bg-border animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-6">
              <div className="aspect-[4/5] w-full rounded-lg bg-border animate-pulse" />
            </div>
            <div className="lg:col-span-6 space-y-4">
              <div className="h-8 w-3/4 rounded bg-border animate-pulse" />
              <div className="h-5 w-1/3 rounded bg-border animate-pulse" />
              <div className="h-24 w-full rounded-lg bg-border animate-pulse" />
              <div className="h-12 w-48 rounded-lg bg-border animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-20 bg-background text-foreground min-h-screen">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
          <Link href="/shop?kind=attar" className="hover:text-pine transition-colors">
            Attars
          </Link>
          <span>/</span>
          <span className="text-brass-deep">{displayProduct.category || "Attar Oil"}</span>
          <span>/</span>
          <span className="text-neutral-900 font-semibold truncate">{displayProduct.name}</span>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Media & Flacon Imagery */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Image Viewport */}
            <div className="border border-border rounded-lg bg-background aspect-[4/5] w-full flex items-center justify-center">
              <img
                src={cloudinarySrc(images[selectedImage] || images[0], 1200)}
                alt={displayProduct.name}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square border rounded-xl bg-pine overflow-hidden transition-all duration-300 cursor-pointer ${
                      selectedImage === i
                        ? 'border-brass ring-2 ring-brass/40 shadow-md'
                        : 'border-coal/10 opacity-70 hover:opacity-100 hover:border-pine/40'
                    }`}
                  >
                    <img src={cloudinarySrc(img, 400)} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Fragrance Presentation & Pyramid */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            {/* Header info */}
            <div className="space-y-2 border-b border-neutral-300/80 pb-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-pine bg-brass/10 border border-brass/30 px-3 py-1 rounded">
                  {brand ? `${brand} · ` : ""}{kind === "attar" ? "Attar" : "Perfume"}{displayProduct.category ? ` · ${displayProduct.category}` : ""}
                </span>

                <span className="font-mono text-xs font-medium flex items-center gap-1.5" style={{ color: stock.status === "out" ? "#9c2b2b" : stock.status === "low" ? "#8C6D37" : "#1d5c3f" }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: stock.status === "out" ? "#9c2b2b" : stock.status === "low" ? "#B79A62" : "#1d5c3f" }} />
                  {stock.label}
                </span>
              </div>

              {isDraft && (
                <p className="inline-flex items-center rounded bg-brass/15 border border-brass/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-pine">
                  Reference draft — confirm notes, sizes &amp; NPR price in admin
                </p>
              )}

              {isBackendMissing && hasPrice && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3.5 text-xs leading-relaxed text-rose-900">
                  <span className="font-semibold">Preview only — not in backend catalog.</span>{" "}
                  The API returned 404 for this slug, so Add to Bag will fail until you create it in{" "}
                  <Link href="/admin/products" className="underline underline-offset-2 font-semibold">/admin → Catalog</Link>{" "}
                  with the same slug (<span className="font-mono">{slug}</span>).
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-tight">
                {displayProduct.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {audiences.map((a) => (
                  <Link
                    key={a}
                    href={`/shop?audience=${a}`}
                    className="font-mono text-[10px] uppercase tracking-widest text-neutral-600 border border-neutral-300/80 rounded px-3 py-1 hover:border-pine hover:text-pine transition-colors"
                  >
                    {AUDIENCE_LABEL[a]}
                  </Link>
                ))}
                <Link
                  href={`/shop?kind=${kind}`}
                  className="font-mono text-[10px] uppercase tracking-widest text-neutral-600 border border-neutral-300/80 rounded px-3 py-1 hover:border-pine hover:text-pine transition-colors"
                >
                  {kind === "attar" ? "Attar Oil" : "Perfume Spray"}
                </Link>
              </div>

              <div className="flex items-baseline gap-3 pt-1">
                {hasPrice ? (
                  <>
                    <span className="text-xl sm:text-2xl font-semibold text-foreground">
                      Rs. {currentPrice.toLocaleString()}
                    </span>
                    {displayProduct.compareAtPrice && Number(displayProduct.compareAtPrice) > currentPrice && (
                      <span className="font-mono text-sm text-neutral-400 line-through">
                        Rs. {Number(displayProduct.compareAtPrice).toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-mono text-xl sm:text-2xl font-semibold text-pine">
                    Price on confirmation — edit in admin
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-light">
              {displayProduct.shortDescription || 'No description available.'}
            </p>

            {/* Attar profile: family, origin, concentration, sizes — derived, verification-flagged */}
            <AttarProductMeta product={displayProduct as unknown as import('@/lib/attar-taxonomy').ProductLike} />

            <VerificationNote compact />

            {/* THE FRAGRANCE PYRAMID ARCHITECTURE */}
            <div className="p-5 sm:p-6 rounded-xl border border-coal/10 bg-white shadow-[0_1px_2px_rgba(40,43,39,0.06)] space-y-4">
              <div className="flex items-center gap-2 border-b border-coal/10 pb-3">
                <Sparkles className="w-4 h-4 text-brass-deep" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-900 font-semibold">
                  Olfactory Pyramid & Notes
                </h3>
              </div>

              <div className="space-y-3 font-sans">
                {/* Top Notes */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-xs">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-pine font-semibold w-24 shrink-0">
                    Top Notes:
                  </span>
                  <span className="text-neutral-800 font-normal">
                    {notes.top.join(", ")}
                  </span>
                </div>

                {/* Heart Notes */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-xs">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-pine font-semibold w-24 shrink-0">
                    Heart Notes:
                  </span>
                  <span className="text-neutral-800 font-normal">
                    {notes.heart.join(", ")}
                  </span>
                </div>

                {/* Base Notes */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-xs">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-pine font-semibold w-24 shrink-0">
                    Base Notes:
                  </span>
                  <span className="text-neutral-800 font-normal">
                    {notes.base.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Flacon Size Selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-semibold uppercase tracking-wider text-neutral-700 text-[11px]">
                  Size — 6ml / 9ml / 12ml oils &amp; 100ml sprays
                </span>
                <span className="font-mono text-pine font-medium text-[11px]">{effectiveSize}</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {sizes.map((s) => {
                  const isSelected = effectiveSize === s.label;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSelectedSize(s.label)}
                      className={`p-3 rounded-md border text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-pine bg-pine text-ivory shadow-md'
                          : 'border-coal/15 bg-white/90 text-coal/80 hover:border-pine/50'
                      }`}
                    >
                      <p className="font-mono text-xs font-semibold">{s.label.split(' / ')[0]}</p>
                      <p className={`text-[10px] font-mono uppercase tracking-wider mt-0.5 ${isSelected ? 'text-ivory/80' : 'text-neutral-400'}`}>
                        {s.price != null && s.price > 0 ? `Rs. ${s.price.toLocaleString()}` : s.tag}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart Action */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                
                {/* Quantity */}
                <div className="flex items-center border border-coal/15 rounded-md bg-white p-1 shadow-[0_1px_2px_rgba(40,43,39,0.06)]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono font-semibold text-xs text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add To Cart CTA */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addCartItem.isPending || !hasPrice || outOfStock || isBackendMissing}
                  title={!hasPrice ? "Set NPR price in /admin before selling this draft" : outOfStock ? "Currently out of stock" : isBackendMissing ? "Create this product in /admin → Catalog before selling" : "Add to bag"}
                  className="btn-primary flex-1 py-4 px-6 shadow-md hover:shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{!hasPrice ? "Price to confirm — contact concierge" : outOfStock ? "Out of stock" : `Add to Bag · Rs. ${(currentPrice * quantity).toLocaleString()}`}</span>
                </button>
              </div>

              {/* Layering + longevity (general guidance, not a per-product promise) */}
              <div className="rounded-xl border border-coal/10 bg-white p-4 text-[12px] leading-relaxed text-neutral-600 shadow-[0_1px_2px_rgba(40,43,39,0.06)]">
                <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-900 font-semibold">How to wear + layer</p>
                <p className="mt-1.5 font-light">
                  Warm one drop on pulse points. Layer oil first, then spray if desired. Fresh/floral for day and prayer;
                  oud, amber, and mukhallat for evening and weddings. Oils are typically close-to-skin but long-lived —
                  actual wear varies; no hour promise until verified.
                </p>
              </div>

              {/* Delivery and Authenticity Micro Details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white border border-coal/10 rounded-xl p-3 flex items-center gap-3 text-[11px] text-neutral-600 shadow-[0_1px_2px_rgba(40,43,39,0.06)]">
                  <Truck className="w-4 h-4 text-pine shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-900 leading-none">Express Courier</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Ships in 2-3 business days</p>
                  </div>
                </div>

                <div className="bg-white border border-coal/10 rounded-xl p-3 flex items-center gap-3 text-[11px] text-neutral-600 shadow-[0_1px_2px_rgba(40,43,39,0.06)]">
                  <ShieldCheck className="w-4 h-4 text-pine shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-900 leading-none">100% Authentic</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Sourced from established attar houses</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Product Reviews Section */}
        <div className="mt-20 border-t border-neutral-300/80 pt-14">
          <ProductReviews productId={typeof displayProduct.id === 'number' ? displayProduct.id : 1} />
        </div>

      </div>
    </div>
  );
}