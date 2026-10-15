import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useHeroSlides } from "@/lib/carousel";
import { cloudinarySrc } from "@/lib/attar-images";

const AUTOPLAY_MS = 2000;

export function HeroCarousel() {
  const { slides, isPending } = useHeroSlides();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const timer = useRef<number | null>(null);
  const preloaded = useRef<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const total = slides.length;
  const current = slides[Math.min(index, total - 1)] ?? slides[0];
  const currentImage = current ? cloudinarySrc(current.image, 1600) : "";

  const go = useCallback(
    (next: number) => {
      if (total <= 1) return;
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  useEffect(() => {
    setIndex(0);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || paused || hovering || shouldReduceMotion) return;
    timer.current = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [index, total, paused, hovering, shouldReduceMotion, go]);

  // Warm the first slide's image the moment slides resolve so it paints
  // without a placeholder gap. Runs once per image URL.
  useEffect(() => {
    if (!currentImage || preloaded.current === currentImage) return;
    preloaded.current = currentImage;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = currentImage;
    link.fetchPriority = "high";
    document.head.appendChild(link);
    const warmer = new Image();
    warmer.src = currentImage;
    return () => {
      document.head.removeChild(link);
    };
  }, [currentImage]);

  // First paint: neutral skeleton while slides load — never flash the
  // fallback slides and then swap them once the API resolves.
  if (isPending) {
    return (
      <section aria-label="Featured collections" className="w-full bg-pine-ink text-ivory">
        <div className="section-pad py-12 sm:py-16 lg:py-20 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="h-3 w-56 rounded bg-white/10 animate-pulse" />
            <div className="mt-4 h-12 w-4/5 rounded-lg bg-white/10 animate-pulse" />
            <div className="mt-3 h-12 w-3/5 rounded-lg bg-white/10 animate-pulse" />
            <div className="mt-8 flex gap-3">
              <div className="h-12 w-44 rounded-lg bg-white/10 animate-pulse" />
              <div className="h-12 w-36 rounded-lg bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="aspect-[4/3] w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!current) return null;

  return (
    <section
      aria-label="Featured collections"
      className="relative w-full overflow-hidden bg-pine-ink text-ivory"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="section-pad py-12 sm:py-16 lg:py-20 grid items-center gap-10 lg:grid-cols-2">
        {/* Copy */}
        <div className="max-w-xl">
          <p className="eyebrow eyebrow-light">Attar House Nepal · Attars first</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`copy-${String(current.id)}`}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.45 }}
            >
              <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08] text-white">
                Discover Premium Attars in Nepal
              </h1>
              <p className="mt-3 text-xl sm:text-2xl font-medium tracking-tight leading-snug text-brass-light">
                {current.title}
              </p>
              {current.description && (
                <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed">
                  {current.description}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {current.ctaLabel && current.ctaHref ? (
                  <Link
                    href={current.ctaHref}
                    className="inline-flex items-center gap-2 rounded-lg bg-ivory px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-pine hover:bg-white transition-colors"
                  >
                    {current.ctaLabel}
                  </Link>
                ) : (
                  <Link
                    href="/shop?kind=attar"
                    className="inline-flex items-center gap-2 rounded-lg bg-ivory px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-pine hover:bg-white transition-colors"
                  >
                    Shop attars
                  </Link>
                )}
                <Link
                  href="/shop?preset=bestsellers"
                  className="rounded-lg border border-white/30 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:border-white hover:bg-white/10 transition-colors"
                >
                  Bestsellers
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls — in flow, never overlapping content */}
          {total > 1 && (
            <div className="mt-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
                {slides.map((s, i) => (
                  <button
                    key={String(s.id)}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Go to slide ${i + 1}: ${s.title}`}
                    onClick={() => go(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-10 bg-ivory" : "w-4 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaused((v) => !v)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
                  aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                >
                  {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => go(index - 1)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
                  aria-label="Previous slide"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => go(index + 1)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-white/25 text-white hover:bg-white/10 transition-colors"
                  aria-label="Next slide"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Framed image — fully visible, fixed aspect, no cropping surprises */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`img-${String(current.id)}`}
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.45 }}
            className="relative overflow-hidden rounded-2xl border border-white/15 bg-pine-deep shadow-2xl"
          >
            <img
              src={currentImage}
              alt={current.title}
              className="aspect-[4/3] w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
