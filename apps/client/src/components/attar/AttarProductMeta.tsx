import { deriveConcentration, deriveFamily, deriveOrigin, deriveSizes, VERIFICATION_COPY, type ProductLike } from "@/lib/attar-taxonomy";
import { MapPin, FlaskConical, Ruler, Leaf } from "lucide-react";

export function AttarProductMeta({ product }: { product: ProductLike }) {
  const family = deriveFamily(product);
  const { origin, needsVerification } = deriveOrigin(product);
  const concentration = deriveConcentration(product);
  const sizes = deriveSizes(product);

  return (
    <div className="rounded-xl border border-coal/10 bg-white p-5 shadow-[0_1px_2px_rgba(40,43,39,0.06)] sm:p-6">
      <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-900">Attar profile</h3>
      <div className="mt-4 space-y-3 text-[13px]">
        <div className="flex items-start gap-3">
          <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-pine" />
          <p><span className="font-semibold">Family:</span> {family.name} — {family.tagline}</p>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pine" />
          <p>
            <span className="font-semibold">Origin story:</span> {origin.name} · {origin.region}
            {needsVerification && <span className="text-neutral-500"> — {VERIFICATION_COPY.perProduct}</span>}
          </p>
        </div>
        <div className="flex items-start gap-3">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-pine" />
          <p><span className="font-semibold">Concentration / type:</span> {concentration}</p>
        </div>
        <div className="flex items-start gap-3">
          <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-pine" />
          <p><span className="font-semibold">Available sizes (as listed):</span> {sizes.join(" · ")}</p>
        </div>
      </div>
      <p className="mt-4 border-t border-neutral-200/80 pt-3 text-[11px] font-light leading-relaxed text-neutral-500">
        Heritage notes on this page describe general attar traditions (Kannauj, Saudi, Dubai). They are not lab-verified
        claims for this specific flacon. Confirm origin, purity, and ingredients with us before purchase.
      </p>
    </div>
  );
}
