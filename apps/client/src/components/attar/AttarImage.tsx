import { useState } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800";

/**
 * AttarImage — product photo with graceful fallback.
 * TODO (owner): replace Unsplash generics with real bottle shots:
 *  - 1:1 front, 6ml roll-on / 9.9ml / 12ml side, spray 100ml, discovery set flat-lay
 *  - Keep filenames by slug in /public/images/attar/ and set product.images to those paths.
 */
export function AttarImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  /** Above-the-fold images must load eagerly with high priority. */
  eager?: boolean;
}) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={!src || err ? FALLBACK : src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      onError={() => setErr(true)}
      className={className}
    />
  );
}
