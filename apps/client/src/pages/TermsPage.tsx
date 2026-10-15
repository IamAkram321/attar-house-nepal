import { Link } from 'wouter';

const sections = [
  {
    title: '1. Overview',
    body: `These Terms & Conditions govern your engagement with the Attar House Nepal boutique, including the purchase of attar oils, sprays, and discovery sets. By placing an order, you confirm acceptance of these terms.`,
  },
  {
    title: '2. Numbered Batches & Pricing',
    body: `Because our creations utilize vintage harvests, pure botanical absolutes, and wild agarwood, availability is subject to seasonal extraction limits. Prices are stated in regional currency and may be updated to reflect raw material vintage yields. Attar House Nepal reserves the right to decline or cancel orders if batch reserves are depleted.`,
  },
  {
    title: '3. Sealed-Bottle Returns',
    body: `Sealed, unopened attar oils and sprays may be returned within the stated window. Once the seal is broken, returns are accepted only for transit damage or defects reported within 48 hours with parcel photographs.`,
  },
  {
    title: '4. Payment Protocols',
    body: `We accept direct bank QR payments (instant transaction confirmation) as well as Cash on Delivery (COD) in verified geographic zones. Orders must be settled in full prior to release from courier custody.`,
  },
  {
    title: '5. Artisanal Botanical Nuance',
    body: `Due to natural variations in Grasse floral harvests, ambergris cures, and agarwood distillations, subtle shifts in color tint or olfactory resonance between vintages are natural hallmarks of authentic perfumery rather than flaws.`,
  },
  {
    title: '6. Intellectual Property & Formulation Rights',
    body: `All fragrance names, accord notes, bottle designs, brand emblems, and visual assets are the exclusive intellectual property of Attar House Nepal.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `Attar House Nepal is not liable for secondary damages resulting from improper storage, misuse, or adverse skin sensitivities. We encourage patch-testing on a small area of skin before full application.`,
  },
  {
    title: '8. Modifications to Terms',
    body: `We reserve the prerogative to revise these conditions periodically. Continued patron engagement confirms agreement with current standards.`,
  },
];

export default function TermsPage() {
  return (
    <div className="pt-36 pb-28 bg-[#FAF8F5] text-neutral-900 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C6D37] mb-2 block">
          Legal Terms
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-neutral-950 mb-3">Terms & Conditions</h1>
        <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-12">Effective: October 2026</p>

        <p className="text-neutral-600 font-light text-base leading-relaxed mb-12">
          Please review these terms before acquiring attars with <strong className="font-medium text-neutral-950">Attar House Nepal</strong>.
        </p>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <h2 className="font-serif text-xl font-normal text-neutral-900 mb-2">{s.title}</h2>
              <p className="text-neutral-600 font-light text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 mt-12 shadow-sm">
          <h3 className="font-serif text-xl font-normal text-neutral-900 mb-2">Concierge Advisory</h3>
          <p className="text-neutral-600 font-light text-sm leading-relaxed">
            For clarification on any terms, please reach out to our private concierge at{' '}
            <a href="mailto:concierge@ayeshafragrances.com" className="text-[#8C6D37] underline font-medium">
              concierge@ayeshafragrances.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}