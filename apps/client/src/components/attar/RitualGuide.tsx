import { APPLICATION_RITUAL, LONGEVITY_GENERAL } from "@/lib/attar-taxonomy";
import { Clock, HandHeart } from "lucide-react";

export function RitualGuide() {
  return (
    <section className="relative bg-ivory py-20 text-neutral-900 md:py-28">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-pine">
              <HandHeart className="h-4 w-4" /> 03 · Ritual
            </p>
            <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
              How to wear <span className="italic text-pine">attar oil.</span>
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-neutral-600 md:text-base">
              Attar is concentrated and alcohol-free. One small drop is enough. This is general guidance —
              not a medical or skin-safety claim. Discontinue if irritation occurs and confirm suitability with the owner.
            </p>
            <div className="mt-6 rounded-xl border border-coal/10 bg-white/90 p-5 shadow-2xs">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-900">
                <Clock className="h-4 w-4 text-brass-deep" /> {LONGEVITY_GENERAL.title}
              </p>
              <p className="mt-2 text-[13px] font-light leading-relaxed text-neutral-600">{LONGEVITY_GENERAL.body}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {APPLICATION_RITUAL.map((r) => (
              <div key={r.step} className="rounded-xl border border-coal/10 bg-pine-deep p-6 text-ivory">
                <p className="font-mono text-[11px] uppercase tracking-widest text-brass">{r.step}</p>
                <h3 className="mt-2 font-serif text-xl">{r.title}</h3>
                <p className="mt-2 text-[13px] font-light leading-relaxed text-neutral-300">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
