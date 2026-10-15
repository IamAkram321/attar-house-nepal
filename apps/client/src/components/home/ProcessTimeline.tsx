import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "../ui/SectionHeading";
import { 
  Sparkles, 
  Compass, 
  FlaskConical, 
  Clock, 
  Crown, 
  CheckCircle2 
} from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Olfactory Vision",
    tagline: "Inspiration & Note Architecture",
    desc: "Every creation begins with an emotional muse and narrative. We map the scent pyramid across luminous top notes, opulent heart bouquets, and deep enduring base foundations.",
    icon: Sparkles,
    specs: ["Olfactive Families: Floral, Woody, Amber", "Consultation: Bespoke Scent Profile", "Diffusion Aura: Intimate to Radiating"],
    badge: "Genesis Stage",
  },
  {
    num: "02",
    title: "Noble Sourcing",
    tagline: "Ethical & Rare Botanical Harvests",
    desc: "We harvest only the most precious natural raw materials: Rose Centifolia hand-picked at dawn in Grasse, aged Cambodian agarwood, wild neroli, and Haitian vetiver.",
    icon: Compass,
    specs: ["100% Traceable Natural Botanicals", "Sustainable Wild Agarwood Sourcing", "Pure Cold-Pressed Italian Citrus"],
    badge: "Harvest & Extraction",
  },
  {
    num: "03",
    title: "Master Blending",
    tagline: "Harmonic Precision Formulation",
    desc: "Our master perfumers calibrate droplet ratios down to the milligram, testing how volatile esters interact on diverse skin chemistries throughout changing ambient temperatures.",
    icon: FlaskConical,
    specs: ["Extrait Strength: 30%+ Pure Oil", "Precision Chromatography Testing", "Skin Temperature Evolution"],
    badge: "Formulation",
  },
  {
    num: "04",
    title: "Cold Maceration",
    tagline: "Unhurried Cellar Maturation",
    desc: "The unblended concentrate rests undisturbed in climate-controlled dark glass vessels for a minimum of 6 months, allowing delicate natural compounds to marry into velvet softness.",
    icon: Clock,
    specs: ["6+ Month Aging In Dark Demijohns", "Controlled Temperature: 14°C", "Pure Molecular Synergy"],
    badge: "Maturation",
  },
  {
    num: "05",
    title: "Haute Flaconnerie",
    tagline: "Crystal Bottling & Final Seal",
    desc: "After gentle chilling and filtration, the elixir is decanted into weighted European crystal flacons, fitted with micro-mist atomizers, and inspected under warm golden light.",
    icon: Crown,
    specs: ["Faceted Crystal Flacon", "Hand-Finished Gold Accents", "Bespoke Wax-Sealed Presentation"],
    badge: "Presentation",
  },
];

export function ProcessTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const current = steps[activeStep];
  const IconComponent = current.icon;

  return (
    <section className="relative py-16 md:py-24 bg-[#FAF8F5] text-neutral-900 border-y border-neutral-300/80 overflow-hidden selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* Background Pattern & Ambient Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#c5a265_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]" />
        <motion.div
          animate={{
            x: (activeStep - 2) * 100,
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] rounded-full bg-gradient-to-r from-amber-300/30 via-orange-200/30 to-transparent blur-[130px]"
        />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 max-w-7xl">
        
        {/* Header Bar */}
        <SectionHeading
          label="04 / Methodology"
          title="The Art of Slow Perfumery"
          align="center"
          className="mb-0"
        />

        {/* STEP SELECTION NODES BAR */}
        <div className="mt-10 md:mt-12 relative">
          
          {/* Connector Line */}
          <div className="absolute top-1/2 left-[10%] right-[10%] -translate-y-1/2 h-[1px] bg-neutral-300 hidden md:block z-0" />

          <div className="grid grid-cols-5 gap-2 md:gap-4 relative z-10">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className="group flex flex-col items-center focus:outline-none cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-mono text-xs sm:text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-neutral-900 text-amber-300 shadow-md border border-neutral-800"
                        : "bg-white text-neutral-500 border border-neutral-300/80 hover:border-amber-500/60 hover:text-neutral-900 shadow-2xs"
                    }`}
                  >
                    {step.num}

                    {/* Active pulse indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                      />
                    )}
                  </motion.div>

                  <span className={`mt-2.5 text-[10px] sm:text-xs font-mono uppercase tracking-wider transition-colors hidden sm:block ${
                    isActive ? "text-neutral-900 font-semibold" : "text-neutral-400 group-hover:text-neutral-600"
                  }`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FEATURED INTERACTIVE HERO STAGE */}
        <div className="mt-8 md:mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative rounded-3xl border border-neutral-300/80 bg-white/90 backdrop-blur-md p-6 sm:p-8 md:p-10 shadow-2xs overflow-hidden"
            >
              {/* Background Number Watermark */}
              <span className="absolute -right-4 -bottom-8 font-serif text-[150px] sm:text-[200px] text-neutral-100 font-normal select-none pointer-events-none z-0 leading-none">
                {current.num}
              </span>

              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative z-10 items-center">
                
                {/* Left Overview Column */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 font-mono text-xs tracking-wider uppercase font-medium">
                    <IconComponent className="w-3.5 h-3.5 text-amber-700" />
                    <span>{current.badge}</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                      Stage {current.num} of 05
                    </span>
                    <h3 className="font-serif text-3xl sm:text-4xl text-neutral-900 tracking-tight font-normal">
                      {current.title}
                    </h3>
                    <p className="font-serif italic text-amber-800 text-base sm:text-lg mt-1">
                      {current.tagline}
                    </p>
                  </div>

                  <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-light max-w-xl">
                    {current.desc}
                  </p>
                </div>

                {/* Right Technical Specs Box */}
                <div className="lg:col-span-5 bg-neutral-900 text-neutral-100 rounded-2xl p-6 sm:p-7 space-y-4 border border-neutral-800 shadow-md">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400">
                    Artisanal Standards
                  </h4>

                  <div className="space-y-3">
                    {current.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300 font-light border-b border-neutral-800/80 pb-2.5 last:border-none last:pb-0">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-[11px] text-neutral-500 font-mono flex justify-between items-center border-t border-neutral-800">
                    <span>Ayesha Fragrances Standard</span>
                    <span className="text-neutral-400">Step {activeStep + 1} of 5</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}