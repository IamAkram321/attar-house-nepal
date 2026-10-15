import { useEffect } from "react";

export const BRAND_NAME = "Attar House Nepal";
export const SITE_TAGLINE = "Premium attars and fragrances available online in Nepal.";

function siteOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "";
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(path: string) {
  const href = path.startsWith("http") ? path : `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
  return href;
}

/** Replace previously injected JSON-LD blocks and append fresh ones. */
function setJsonLd(blocks: Record<string, unknown>[]) {
  document.querySelectorAll('script[data-seo-json]').forEach((el) => el.remove());
  for (const block of blocks) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-json", "true");
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  }
}

export interface SEOOptions {
  /** Root-relative path, e.g. "/shop?kind=attar". Defaults to current location. */
  canonical?: string;
  /** Defaults to "index, follow". Pass "noindex, nofollow" for private pages. */
  robots?: string;
  /** Root-relative or absolute image URL for og:image / twitter:image. */
  image?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>[];
}

const NOINDEX = "noindex, nofollow";

/**
 * Set document title + meta description + canonical + robots + social tags
 * per route. Backwards compatible with the old (title, description) calls.
 */
export function useAttarSEO(title: string, description: string, opts: SEOOptions = {}) {
  const { canonical, robots, image, ogType, jsonLd } = opts;
  useEffect(() => {
    document.title = title;
    setMetaName("description", description);
    setMetaName("robots", robots ?? "index, follow");
    const url = setCanonical(canonical ?? `${window.location.pathname}${window.location.search}`);
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:type", ogType ?? "website");
    setMetaProperty("og:url", url);
    setMetaProperty("og:site_name", BRAND_NAME);
    if (image) setMetaProperty("og:image", image.startsWith("http") ? image : `${siteOrigin()}${image}`);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", description);
    setJsonLd(jsonLd ?? []);
  }, [title, description, canonical, robots, image, ogType, JSON.stringify(jsonLd ?? [])]);
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${origin}${t.path}`,
    })),
  };
}

export function productJsonLd(input: {
  name: string;
  brand?: string | null;
  image?: string;
  description?: string;
  price?: number | null;
  inStock?: boolean;
  urlPath: string;
}) {
  const origin = siteOrigin();
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    url: `${origin}${input.urlPath}`,
  };
  if (input.image) product.image = [input.image.startsWith("http") ? input.image : `${origin}${input.image}`];
  if (input.description) product.description = input.description;
  if (input.brand) product.brand = { "@type": "Brand", name: input.brand };
  // Only emit a priced Offer from real backend values — never fallback guesses.
  if (input.price != null && Number.isFinite(input.price) && input.price > 0) {
    product.offers = {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: input.price,
      availability: input.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${origin}${input.urlPath}`,
    };
  }
  return product;
}

export const ATTAR_SEO = {
  home: {
    title: "Buy Attar Online in Nepal | Attar House Nepal",
    desc: "Discover premium attars and fragrances at Attar House Nepal. Explore attars from popular fragrance brands and find your favourite scent. Shop online in Nepal.",
  },
  shop: {
    title: "Buy Attar Online in Nepal | Attar House Nepal",
    desc: "Shop attars online in Nepal at Attar House Nepal — musk, oud, floral, fruity, woody, sweet, fresh and oriental oils in 3–12ml sizes.",
  },
  collections: {
    title: "Attar Collections in Nepal | Attar House Nepal",
    desc: "Browse attar collections at Attar House Nepal — Hindi heritage, Arabian classic and Dubai modern oriental stories.",
  },
  brands: {
    title: "Attar Brands in Nepal | Attar House Nepal",
    desc: "Shop attars by brand at Attar House Nepal — Al-Nuaim, Al-Rehab, Adil Qadri and more fragrance houses.",
  },
  offers: {
    title: "Attar and Perfume Offers in Nepal | Attar House Nepal",
    desc: "Attar combo deals and special offers at Attar House Nepal. Discounts show against each product's own listed price.",
  },
  about: {
    title: "About Us | Attar House Nepal",
    desc: "Attar House Nepal is a Nepal-based importer and retailer of established attar houses. Attars first, always.",
  },
  contact: {
    title: "Contact Us | Attar House Nepal",
    desc: "Contact Attar House Nepal for order help, product questions and store inquiries.",
  },
  account: {
    title: "My Account | Attar House Nepal",
    desc: "View your Attar House Nepal profile, orders and shopping bag.",
  },
  cart: {
    title: "Shopping Bag | Attar House Nepal",
    desc: "Review your Attar House Nepal shopping bag before checkout.",
  },
  checkout: {
    title: "Checkout | Attar House Nepal",
    desc: "Checkout securely at Attar House Nepal with Cash on Delivery, QR, eSewa or Khalti.",
  },
  product: (name: string, brand?: string | null) => {
    const full = brand ? `${brand} ${name}` : name;
    return {
      title: `${full} Attar in Nepal | Attar House Nepal`,
      desc: `Explore ${full} attar at Attar House Nepal. Check available sizes, pricing and product details.`,
    };
  },
} as const;

export interface ShopSEOInput {
  audience?: string;
  kind?: string;
  family?: string;
  familyName?: string;
  brand?: string;
  preset?: string;
}

/** Unique title + description + H1 per shop listing state (spec §5). */
export function shopSEOFor(q: ShopSEOInput): { title: string; desc: string; h1: string } {
  const suffix = `| ${BRAND_NAME}`;
  if (q.preset === "bestsellers") {
    return {
      title: `Bestselling Attars in Nepal ${suffix}`,
      desc: "Customer favourite attars at Attar House Nepal — the oils shoppers in Nepal reach for again and again.",
      h1: "Customer Favourite Fragrances",
    };
  }
  if (q.preset === "combos") {
    return {
      title: `Attar Combo Deals in Nepal ${suffix}`,
      desc: "Attar combo deals and multi-flacon sets at Attar House Nepal.",
      h1: "Attar Combo Deals",
    };
  }
  if (q.preset === "offers" || q.preset === "discounted") {
    return {
      title: `Attar and Perfume Offers in Nepal ${suffix}`,
      desc: "Special offers and discounted attars at Attar House Nepal, reduced from their listed prices.",
      h1: "Explore Fragrance Offers",
    };
  }
  if (q.preset === "new") {
    return {
      title: `New Attar Arrivals in Nepal ${suffix}`,
      desc: "New attar arrivals at Attar House Nepal — recently stocked oils and sprays.",
      h1: "New Arrivals",
    };
  }
  if (q.preset === "favourites") {
    return {
      title: `Most Loved Fragrances in Nepal ${suffix}`,
      desc: "Top-rated attars and perfumes at Attar House Nepal, loved by customers.",
      h1: "Customer Favourite Fragrances",
    };
  }
  if (q.brand && q.brand !== "all" && q.brand !== "other") {
    return {
      title: `${q.brand} Attars in Nepal ${suffix}`,
      desc: `Shop ${q.brand} attars online in Nepal at Attar House Nepal. Check sizes, prices and product details.`,
      h1: `Shop ${q.brand} Attars`,
    };
  }
  if (q.family && q.family !== "all") {
    const fam = q.familyName ?? q.family;
    return {
      title: `${fam} Attars in Nepal ${suffix}`,
      desc: `Shop ${fam.toLowerCase()} attars online in Nepal at Attar House Nepal — oils in 3–12ml sizes.`,
      h1: `Shop ${fam} Attars`,
    };
  }
  const isPerfume = q.kind === "perfume";
  if (q.audience === "him") {
    return {
      title: isPerfume ? `Perfumes for Men in Nepal ${suffix}` : `Attar for Men in Nepal ${suffix}`,
      desc: `Explore attars for men at Attar House Nepal — musk, oud, woody and oriental oils, plus sprays.`,
      h1: isPerfume ? "Explore Perfumes for Men" : "Explore Attars for Men",
    };
  }
  if (q.audience === "her") {
    return {
      title: isPerfume ? `Perfumes for Women in Nepal ${suffix}` : `Attar for Women in Nepal ${suffix}`,
      desc: `Explore attars for women at Attar House Nepal — floral, fruity, musk and sweet oils, plus sprays.`,
      h1: isPerfume ? "Explore Perfumes for Women" : "Explore Attars for Women",
    };
  }
  if (q.audience === "unisex") {
    return {
      title: `Unisex Attars in Nepal ${suffix}`,
      desc: `Explore unisex fragrances at Attar House Nepal — attar oils worn by everyone.`,
      h1: "Explore Unisex Fragrances",
    };
  }
  if (isPerfume) {
    return {
      title: `Buy Perfumes Online in Nepal ${suffix}`,
      desc: "Shop perfumes online in Nepal at Attar House Nepal — sprays alongside our attar-first shelves.",
      h1: "Explore Perfumes",
    };
  }
  return {
    title: `Buy Attar Online in Nepal ${suffix}`,
    desc: ATTAR_SEO.shop.desc,
    h1: "Shop Premium Attars in Nepal",
  };
}

export { NOINDEX };
