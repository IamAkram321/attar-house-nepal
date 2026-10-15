import { Link } from "wouter";
import { MapPin, MessageCircle, Store, ArrowUpRight } from "lucide-react";
import { ATTAR_STORE } from "@/lib/attar-store";

/** In-store tester wall + WhatsApp + marketplace. All links editable in attar-store.ts. */
export function StoreExperience() {
  return (
    <section className="relative overflow-hidden bg-pine-deep py-20 text-ivory md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(#B79A62_1px,transparent_1px)] [background-size:36px_36px] opacity-[0.05]" />
      </div>
      <div className="container relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brass">
              <Store className="h-4 w-4" /> 04 · Visit & try
            </p>
            <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Smell first. <span className="italic text-brass-light">Decide on skin.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-neutral-300 md:text-base">
              {ATTAR_STORE.addressLine1} · {ATTAR_STORE.hours}. Tester-wall lineup and vial count to confirm —
              ask concierge before visiting for a specific attar.
            </p>
            <ul className="mt-6 space-y-2.5">
              {ATTAR_STORE.testerWall.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13px] font-light text-neutral-200">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-md bg-brass" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={ATTAR_STORE.whatsappHref} className="inline-flex items-center gap-2 rounded-md bg-brass px-6 py-3 font-mono text-xs uppercase tracking-widest text-pine-deep hover:bg-ivory">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp order
              </a>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3 font-mono text-xs uppercase tracking-widest text-white hover:border-brass">
                <MapPin className="h-3.5 w-3.5" /> Plan visit
              </Link>
              <a href={ATTAR_STORE.darazHref} className="inline-flex items-center gap-1.5 px-2 py-3 font-mono text-[11px] uppercase tracking-widest text-ivory/80 hover:text-ivory">
                Daraz shop <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ivory">Social drops — edit links in attar-store.ts</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a href={ATTAR_STORE.tiktokHref} className="rounded-xl border border-white/10 bg-black/30 p-5 hover:border-brass/50">
                  <p className="font-serif text-xl">TikTok drops</p>
                  <p className="mt-1 text-xs font-light text-neutral-400">Weekly oil reveals, layering demos. Handle TO CONFIRM.</p>
                </a>
                <a href={ATTAR_STORE.instagramHref} className="rounded-xl border border-white/10 bg-black/30 p-5 hover:border-brass/50">
                  <p className="font-serif text-xl">Instagram</p>
                  <p className="mt-1 text-xs font-light text-neutral-400">Tester-wall restocks, combos. Handle TO CONFIRM.</p>
                </a>
              </div>
              <p className="mt-4 text-[11px] font-light leading-relaxed text-neutral-400">
                {ATTAR_STORE.addressLine2} · {ATTAR_STORE.phoneDisplay}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
