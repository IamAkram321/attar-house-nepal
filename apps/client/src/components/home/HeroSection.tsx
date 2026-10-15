import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles, Compass, ShieldCheck, Droplet } from 'lucide-react';
import { Magnetic } from '@/components/ui/Magnetic';

const heroSlides = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1600',
    title: 'Oud Royale Extrait',
    subtitle: 'Rare Cambodian Agarwood & Smoked Amber',
    tag: 'EXTRAIT DE PARFUM / 32% CONCENTRATION',
    spec: '12+ Hours Royal Sillage'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1600',
    title: 'Rose Impériale de Grasse',
    subtitle: 'Dawn-Harvested Centifolia & Damask Blossom',
    tag: 'FLORAL HAUTE BOTANICAL',
    spec: 'Pure Essential Distillation'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1600',
    title: 'Santal Blanc & Cashmere',
    subtitle: 'Creamy Mysore Sandalwood & White Orris Butter',
    tag: 'WOODY / ORIENTAL',
    spec: 'Aged 12 Months in Dark Flacons'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1600',
    title: 'Velvet Amber Noir',
    subtitle: 'Smoked Labdanum & Spiced Bourbon Vanilla',
    tag: 'PRIVATE BESPOKE RESERVE',
    spec: 'Hand-Numbered Edition'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1600',
    title: 'Soleil de Neroli',
    subtitle: 'Calabrian Bergamot, Wild Neroli & Ambergris',
    tag: 'FRESH CITRUS & SOLAR',
    spec: 'Cold-Pressed Italian Botanicals'
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 1.05,
    filter: 'blur(4px)',
  }),
  center: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
  }),
};

const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

export function HeroSection() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentIndex = ((page % heroSlides.length) + heroSlides.length) % heroSlides.length;

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        paginate(1);
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, paginate]);

  const handleManualSelect = (index: number) => {
    const dir = index > currentIndex ? 1 : -1;
    setPage([index, dir]);
  };

  return (
    <section className="relative w-full min-h-screen lg:h-dvh flex flex-col justify-between bg-[#FAF8F5] text-neutral-900 overflow-hidden selection:bg-amber-500/20 selection:text-amber-900 pt-28 sm:pt-32 pb-8">
      
      {/* Background Lighting & Soft Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#c5a265_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.035]" />
        <div className="absolute -left-20 top-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-amber-200/25 via-orange-100/15 to-transparent blur-[150px]" />
        <div className="absolute -right-20 bottom-10 w-[750px] h-[750px] rounded-full bg-gradient-to-tl from-amber-300/15 via-amber-100/15 to-transparent blur-[160px]" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 my-auto">
        <motion.div
          variants={heroStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        >
          
          {/* Left Hero Column */}
          <div className="lg:col-span-5 flex flex-col justify-center">

            {/* Badges */}
            <motion.div variants={heroItem} className="flex items-center gap-2.5 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-neutral-300/80 shadow-2xs font-mono text-[10px] text-neutral-800 tracking-wider uppercase font-semibold">
                <Sparkles className="w-3 h-3 text-amber-600" />
                AAISHA FRAGRANCES
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-600/20 font-mono text-[10px] text-amber-800 tracking-wider uppercase font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                Haute Parfumerie
              </span>
            </motion.div>

            {/* Editorial Title */}
            <motion.h1
              variants={heroItem}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-neutral-900 tracking-tight mb-6"
            >
              Scents. <br />
              <span className="italic font-normal text-amber-800/85">Transcending</span> <br />
              Memory.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={heroItem}
              className="text-neutral-600 font-light text-base sm:text-lg leading-relaxed mb-8 max-w-md"
            >
              Formulated with rare natural botanical extracts, aged Cambodian oud, and timeless artisanal mastery. An intimate olfactory journey crafted for the discerning connoisseur.
            </motion.p>

            {/* Call To Actions */}
            <motion.div variants={heroItem} className="flex flex-wrap items-center gap-4 mb-10">
              <Magnetic strength={10}>
                <Link
                  href="/shop"
                  className="group relative overflow-hidden rounded-full bg-neutral-900 text-amber-200 px-7 py-3.5 font-mono text-xs uppercase tracking-widest shadow-md hover:bg-neutral-800 transition-all duration-300 flex items-center justify-center gap-3 border border-neutral-800"
                >
                  <span>Explore Fragrances</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Magnetic>

              <Magnetic strength={10}>
                <Link
                  href="/custom-studio"
                  className="rounded-full border border-neutral-300/90 bg-white/80 backdrop-blur-md text-neutral-800 px-7 py-3.5 font-mono text-xs uppercase tracking-widest hover:border-amber-500/60 hover:bg-white hover:text-amber-900 shadow-2xs transition-all duration-300 flex items-center justify-center"
                >
                  Bespoke Creation
                </Link>
              </Magnetic>
            </motion.div>

            {/* Micro Specs */}
            <motion.div variants={heroItem} className="grid grid-cols-2 gap-4 border-t border-neutral-300/80 pt-6">
              <div className="flex items-center gap-2.5">
                <Droplet className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-mono text-[11px] text-neutral-600 uppercase tracking-wider font-medium">
                  30%+ Extrait Oil
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-mono text-[11px] text-neutral-600 uppercase tracking-wider font-medium">
                  Ethically Sourced
                </span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Full Bleed Showcase Stage */}
          <motion.div
            variants={heroItem}
            className="lg:col-span-7 w-full h-[430px] sm:h-[490px] lg:h-[540px] relative flex flex-col justify-center"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
          >
            {/* Gallery Frame Container */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-neutral-300/80 bg-neutral-900 group">
              
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={page}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={heroSlides[currentIndex].url}
                    alt={heroSlides[currentIndex].title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient Overlay for Readable Text & Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none z-20" />

              {/* Top Tag Pill */}
              <div className="absolute top-5 left-5 z-30">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/20 backdrop-blur-xl font-mono text-[10px] text-amber-300 tracking-wider uppercase font-medium shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {heroSlides[currentIndex].tag}
                </span>
              </div>

              {/* Bottom Details & Pause Toggle */}
              <div className="absolute bottom-5 left-5 right-5 z-30 flex items-end justify-between gap-4">
                <div className="max-w-md">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-300 font-semibold mb-1 block drop-shadow-xs">
                    {heroSlides[currentIndex].spec}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal leading-snug drop-shadow-md">
                    {heroSlides[currentIndex].title}
                  </h3>
                  <p className="text-neutral-300 text-xs sm:text-sm font-light mt-0.5">
                    {heroSlides[currentIndex].subtitle}
                  </p>
                </div>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition-all duration-300 shrink-0 shadow-lg hover:scale-105"
                  title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
              </div>

              {/* Navigation Chevrons */}
              <button
                onClick={() => paginate(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-xl text-white border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => paginate(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-xl text-white border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Dots & Counter Bar */}
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-2">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => handleManualSelect(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-8 bg-amber-700'
                        : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest font-semibold">
                0{currentIndex + 1} / 0{heroSlides.length}
              </span>
            </div>

          </motion.div>
        </motion.div>
      </div>

      {/* Footer Meta Line */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 pt-6">
        <div className="flex items-center justify-between border-t border-neutral-300/80 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-7 rounded-full border border-neutral-400 bg-white/60 backdrop-blur-2xs p-1 flex justify-center shadow-2xs">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="w-1 h-1 rounded-full bg-amber-700"
              />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
              Scroll To Experience
            </span>
          </div>

          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-medium hidden sm:inline">
            EXTRAIT DE PARFUM &middot; GRASSE FLORALS &middot; CAMBODIAN OUD &middot; BESPOKE BLENDS
          </span>
        </div>
      </div>

    </section>
  );
}