import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

export function BrandStatement() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  const words = "A fragrance is the most intimate form of memory.".split(" ");

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-32 md:py-44 min-h-[85vh] flex items-center bg-[#0C0B0A] text-white selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* ===========================
          ATMOSPHERIC AMBER GLOW & TEXTURE
      ============================ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft amber illumination orb */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 65% 50%, rgba(212,175,55,0.18), rgba(184,149,106,0.08) 40%, transparent 70%)",
          }}
        />

        {/* Delicate golden stardust / grain pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#c5a265_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]" />
      </div>

      {/* ===========================
          CONTENT
      ============================ */}
      <div className="container relative z-10 mx-auto max-w-6xl px-6">
        <div className="max-w-4xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[10px] text-amber-300 uppercase tracking-widest font-semibold">
              The Olfactive Philosophy
            </span>
          </div>

          <h2 className="font-serif text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.08] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {words.map((word, i) => {
              const start = i / words.length;
              const end = start + 1 / words.length;

              const opacity = useTransform(
                scrollYProgress,
                [start, end],
                [0.45, 1]
              );

              const y = useTransform(
                scrollYProgress,
                [start, end],
                [15, 0]
              );

              return (
                <motion.span
                  key={i}
                  style={{ opacity, y }}
                  className="inline-block mr-3 md:mr-5"
                >
                  {word === "fragrance" || word === "intimate" || word === "memory." ? (
                    <span className="italic text-amber-300 font-normal drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">
                      {word}
                    </span>
                  ) : (
                    word
                  )}
                </motion.span>
              );
            })}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="mt-10 max-w-2xl text-base md:text-xl leading-relaxed text-neutral-300 font-light"
          >
            Every creation at Attar House Nepal begins as an unhurried reverie. We source rare petals hand-harvested at dawn in Grasse, pure wild Cambodian agarwood, and aged Bourbon vanilla. Each batch is cold-macerated for months to achieve unparalleled depth, longevity, and sublime distinction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55 }}
            className="mt-12 flex flex-wrap gap-4 items-center"
          >
            <Link href="/shop">
              <button
                className="
                group
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-amber-400/60
                bg-amber-500/20
                backdrop-blur-md
                px-8
                py-4
                uppercase
                tracking-[0.25em]
                text-xs
                font-mono
                font-semibold
                text-amber-300
                transition-all
                hover:bg-amber-400
                hover:text-black
                hover:border-amber-400
                shadow-lg
                cursor-pointer
              "
              >
                Explore the Attar Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            <Link href="/about">
              <button
                className="
                group
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/5
                backdrop-blur-md
                px-7
                py-4
                uppercase
                tracking-[0.25em]
                text-xs
                font-mono
                text-neutral-300
                transition-all
                hover:border-white/30
                hover:text-white
                cursor-pointer
              "
              >
                Read Our Story
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}