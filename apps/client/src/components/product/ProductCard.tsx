import { Link } from "wouter";
import { AttarImage } from "@/components/attar/AttarImage";
import { cloudinarySrc } from "@/lib/attar-images";
import { getBrand, getBadges, discountPercent, startingPrice, sizeOptions } from "@/lib/catalog";

export interface Product {
  id: string | number;
  name: string;
  slug?: string;
  price?: number;
  compareAtPrice?: number | null;
  category?: string;
  materials?: string | string[];
  colors?: string | string[];
  imageUrl?: string;
  image_url?: string;
  image?: string;
  images?: string[];
  shortDescription?: string;
  featured?: boolean;
}

export function getProductImageUrl(product: Product): string {
  if (product.imageUrl) return product.imageUrl;
  if (product.image_url) return product.image_url;
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  return "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800";
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const imageSrc = cloudinarySrc(getProductImageUrl(product), 800);
  const productLink = `/product/${product.slug || product.id}`;
  const brand = getBrand(product as any) ?? null;
  const badges = getBadges(product as any);
  const saving = discountPercent(product as any);
  const sizes = sizeOptions(product as any);
  const from = startingPrice(product as any);
  const multiPrice = sizes.filter((s) => s.price != null && s.price > 0).length > 1;
  const sizeLabel =
    Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors.slice(0, 2).join(" / ")
      : sizes.length > 0
        ? sizes[0].label
        : "6ml";

  return (
    <article className="flex flex-col">
      <Link href={productLink} className="block" aria-label={product.name}>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-beige border border-coal/10">
          <AttarImage
            src={imageSrc}
            alt={product.name}
            eager={index < 4}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {badges.includes("bestseller") && (
              <span className="rounded-md bg-pine px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ivory">
                Bestseller
              </span>
            )}
            {badges.includes("new") && (
              <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-pine border border-pine/20">
                New
              </span>
            )}
            {saving > 0 && (
              <span className="rounded-md bg-brass-deep px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                −{saving}%
              </span>
            )}
            {badges.includes("combo") && (
              <span className="rounded-md bg-charcoal px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Combo
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-3 flex flex-col gap-0.5 px-0.5">
        {brand && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-deep truncate">
            {brand}
          </p>
        )}
        <Link href={productLink} className="hover:text-pine transition-colors">
          <h3 className="text-[15px] font-semibold text-coal leading-snug line-clamp-1">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2">
          {from != null ? (
            <p className="text-sm font-semibold text-coal">
              {multiPrice && <span className="font-normal text-coal/50">From </span>}
              Rs. {from.toLocaleString()}
            </p>
          ) : (
            <p className="text-xs font-medium text-brass-deep">Price on confirm</p>
          )}
          <p className="text-[11px] text-coal/50">{sizeLabel}</p>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
