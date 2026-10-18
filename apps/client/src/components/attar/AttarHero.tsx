import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ATTAR_I18N } from "@/lib/attar-i18n";
import { buildShopHref } from "@/lib/catalog";

export function AttarHero() {
  return (
    <section className="relative w-full overflow-hidden bg-pine text-ivory">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="mb-2 font-semibold text-xs uppercase tracking-widest text-brass-light">Nepal · Imported attar houses</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05] text-ivory">
            Attars worth
            <br />
            <span className="italic text-brass-light">keeping close.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
            Concentrated oils from Al-Nuaim, Al-Rehab and Adil Qadri — musk, oud,
            floral, fruity and oriental families, shelved for Him, for Her and for Everyone.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={buildShopHref({ kind: "attar" })}
              className="inline-flex items-center gap-3 rounded-lg bg-ivory px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-pine hover:bg-white transition-colors"
            >
              <span>Explore Our Attars</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group" />
            </Link>
            <Link
              href={buildShopHref({ preset: "bestsellers" })}
              className="rounded-lg border border-ivory/30 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory hover:border-brass hover:text-brass transition-colors"
            >
              Bestsellers
            </Link>
            <Link
              href="/brands"
              className="rounded-lg border border-ivory/30 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory hover:border-brass hover:text-brass transition-colors"
            >
              Shop by Brand
            </Link>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-ivory/15 pt-6 max-w-xl">
            {[
              ["3–12ml", "Attar oils"],
              ["9", "Fragrance families"],
              ["3", "Him · Her · Unisex"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-2xl font-semibold text-brass">{v}</dt>
                <dd className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ivory/60">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-lg border border-brass/40 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1400"
              alt="Attar oil bottles"
              className="h-[380px] w-full object-cover sm:h-[480px]"
            />
            <div className="absolute left-5 right-5 bottom-5 flex items-end justify-between gap-4 border-t border-ivory/25 pt-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass">
                  Tester wall approved
                </p>
                <p className="mt-1 text-2xl font-semibold text-ivory">Oud · Musk · Rose · Amber</p>
              </div>
              <span className="rounded border border-ivory/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ivory">
                6ml / 12ml oils
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
