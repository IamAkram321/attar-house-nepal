/**
 * Ayesha Fragrances — Local-first attar imagery (EDITABLE)
 * =========================================================
 * Owner photo TODO (real bottle shots beat Unsplash):
 *  - /public/images/attar/6ml-rollon-front.jpg
 *  - /public/images/attar/9-9ml-royale.jpg
 *  - /public/images/attar/12ml-mukhallat.jpg
 *  - /public/images/attar/100ml-spray.jpg
 *  - /public/images/attar/discovery-5x2ml-flatlay.jpg
 *  - /public/images/attar/oud-rose-musk-amber-family.jpg (per family)
 *
 * How to use: set product.images to local paths above. Anything missing
 * falls back to the generic Unsplash URL below (no brand copying).
 */

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1200`;

export const ATTAR_IMAGE_FALLBACKS = {
  oud: U("photo-1592945403244-b3fbafd7f539"),
  rose: U("photo-1547887537-6158d64c35b3"),
  musk: U("photo-1594035910387-fea47794261f"),
  amber: U("photo-1523293182086-7651a899d37f"),
  fresh: U("photo-1616949755610-8c9bbc08f138"),
  wood: U("photo-1588405748880-12d1d2a59f75"),
} as const;

export function attarImage(localPath: string | undefined, fallback: keyof typeof ATTAR_IMAGE_FALLBACKS): string {
  if (localPath && localPath.trim()) return localPath;
  return ATTAR_IMAGE_FALLBACKS[fallback];
}

/**
 * Optimize Cloudinary delivery URLs (format + quality + width).
 * Only rewrites res.cloudinary.com URLs — Unsplash/local URLs pass through
 * untouched. Product data is never modified, only the delivered variant.
 */
export function cloudinarySrc(url: string | undefined, width = 1200): string {
  if (!url) return "";
  if (!/res\.cloudinary\.com/.test(url)) return url;
  if (!/\/image\/upload\//.test(url)) return url;
  if (/\/f_auto/.test(url)) return url;
  return url.replace(
    /\/image\/upload\//,
    `/image/upload/f_auto,q_auto,w_${width}/`
  );
}
