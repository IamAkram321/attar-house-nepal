import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ATTAR_I18N } from "@/lib/attar-i18n";
import { buildShopHref } from "@/lib/catalog";

export function AttarHero() {
  return (
    <section className="relative w-full overflow-hidden bg-pine-deep text-ivory">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6"
        >
          <p className="eyebrow !text-brass">Nepal · Imported attar houses</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl text-ivory">
            Attars worth
            <br />
            <span className="italic font-light text-brass-light">keeping close.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-ivory/80 sm:text-lg">
            Concentrated oils from Al-Nuaim, Al-Rehab and Adil Qadri — musk, oud,
            floral, fruity and oriental families, shelved for Him, for Her and for Everyone.
          </p>
          <p className="mt-2 max-w-xl text-sm font-light text-ivory/60">
            {ATTAR_I18N.heroKickerNe} — {ATTAR_I18N.heroSubNe}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={buildShopHref({ kind: "attar" })}
              className="group inline-flex items-center gap-3 rounded-md bg-ivory px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-pine font-semibold transition-colors hover:bg-white"
            >
              <span>Explore Our Attars</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={buildShopHref({ preset: "bestsellers" })}
              className="rounded-md border border-ivory/30 px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-ivory transition-colors hover:border-brass hover:text-brass"
            >
              Bestsellers
            </Link>
            <Link
              href="/brands"
              className="rounded-md border border-ivory/30 px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-ivory transition-colors hover:border-brass hover:text-brass"
            >
              Shop by Brand
            </Link>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-ivory/15 pt-6 max-w-xl">
            {[
              ["3–12ml", "Attar oils"],
              ["9", "Fragrance families"],
              ["3", "Him · Her · Unisex"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl text-brass">{v}</dt>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/60">{l}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-6"
        >
          <div className="relative overflow-hidden rounded-xl border border-brass/40 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1400"
              alt="Attar oil bottles"
              className="h-[380px] w-full object-cover brightness-[0.92] sm:h-[480px]"
            />
            <div className="absolute left-5 right-5 bottom-5 flex items-end justify-between gap-4 border-t border-ivory/25 pt-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass">
                  Tester wall approved
                </p>
                <p className="mt-1 font-display text-2xl text-ivory">Oud · Musk · Rose · Amber</p>
              </div>
              <span className="rounded border border-ivory/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ivory">
                6ml / 12ml oils
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
