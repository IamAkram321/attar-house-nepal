import { Link } from 'wouter';
import { Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="pt-36 pb-28 bg-[#FAF8F5] text-neutral-900 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C6D37] mb-2 block">
            Maison Assurance
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-neutral-950 mb-4">
            Returns & Exchanges
          </h1>
          <p className="text-neutral-600 font-light text-base md:text-lg leading-relaxed">
            At Attar House Nepal, we understand that discovering your signature scent requires intimacy and time on skin.
          </p>
        </div>

        <div className="space-y-10">
          <div className="p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#C5A265]" />
              <h2 className="font-serif text-2xl font-normal text-neutral-900">Unopened Returns</h2>
            </div>
            <p className="text-neutral-600 font-light text-sm leading-relaxed">
              Sealed, unopened attar oils and sprays may be returned within 14 days of delivery for a full refund or exchange. To qualify, the presentation seal must be intact. Contact the concierge to arrange a return.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#C5A265]" />
              <h2 className="font-serif text-2xl font-normal text-neutral-900">Opened Flacon Policy</h2>
            </div>
            <p className="text-neutral-600 font-light text-sm leading-relaxed">
              Due to the delicate hygiene standards and organic composition of luxury perfumery, once the outer wax seal or cellophane wrap of the primary flacon has been unsealed, we cannot accept returns for refund. This guarantees every patron receives an unadulterated, pristine formulation.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#C5A265]" />
              <h2 className="font-serif text-2xl font-normal text-neutral-900">Unopened Attar Returns</h2>
            </div>
            <p className="text-neutral-600 font-light text-sm leading-relaxed">
              Sealed, unopened attar oils and sprays may be returned within the stated window. If a scent is not your signature, contact the concierge — unopened items are refunded in full.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm">
            <h2 className="font-serif text-2xl font-normal text-neutral-900 mb-3">Transit Damage or Flacon Defects</h2>
            <p className="text-neutral-600 font-light text-sm leading-relaxed">
              In the unlikely event your flacon arrives damaged, with micro-fractures, or with a leaking atomizer nozzle, please photograph the parcel and contact our concierge within 48 hours of receipt. We will dispatch an immediate replacement without cost.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-md mt-14">
          <h3 className="font-serif text-2xl font-normal text-neutral-900 mb-3">Need Assistance with an Exchange?</h3>
          <p className="text-neutral-600 font-light text-sm leading-relaxed mb-4">
            Our private concierge team is dedicated to your complete satisfaction with your olfactive journey.
          </p>
          <Link href="/contact" className="text-[#8C6D37] font-medium underline underline-offset-4 hover:text-neutral-950 font-mono text-xs uppercase tracking-widest">
            Contact Concierge Services →
          </Link>
        </div>
      </div>
    </div>
  );
}