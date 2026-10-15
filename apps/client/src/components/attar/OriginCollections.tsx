import { motion } from "framer-motion";
import { Link } from "wouter";
import { ATTAR_ORIGINS } from "@/lib/attar-taxonomy";
import { ArrowUpRight, MapPin } from "lucide-react";

const ORIGIN_IMAGES: Record<string, string> = {
  "hindi-heritage":
    "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200",
  "arabian-classic":
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1200",
  "dubai-modern":
    "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1200",
};

export function OriginCollections() {
  const origins = ATTAR_ORIGINS.slice(0, 3);
  return (
    <section className="relative overflow-hidden bg-pine-deep py-20 text-ivory md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(#B79A62_1px,transparent_1px)] [background-size:36px_36px] opacity-[0.05]" />
        <div className="absolute -right-20 top-10 h-[480px] w-[480px] rounded-full bg-pine/60 blur-[140px]" />
      </div>
      <div className="container relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-brass">02 · Origins</p>
        <h2 className="max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
          Indian heritage, Saudi ritual, <span className="italic text-brass-light">Dubai modernity.</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-neutral-300 md:text-base">
          General heritage stories below — not per-product origin claims. Product origins are shown on each product page as currently listed and need owner confirmation.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {origins.map((o, i) => (
            <motion.div
              key={o.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-neutral-950"
            >
              <img
                src={ORIGIN_IMAGES[o.slug]}
                alt={o.name}
                className="h-56 w-full object-cover brightness-[0.85] transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="p-6">
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brass">
                  <MapPin className="h-3 w-3" /> {o.region}
                </p>
                <h3 className="mt-2 font-serif text-2xl">{o.name}</h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-neutral-400">{o.tagline}</p>
                <p className="mt-3 line-clamp-4 text-[13px] font-light leading-relaxed text-neutral-300">{o.story}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {o.formats.map((f) => (
                    <span key={f} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-200">
                      {f}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/shop?origin=${o.slug}`}
                  className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-brass hover:text-ivory"
                >
                  Shop this origin <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
