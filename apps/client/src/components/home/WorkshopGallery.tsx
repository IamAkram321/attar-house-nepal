import { motion, type Variants } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { Sparkles, MapPin } from 'lucide-react';

const galleryItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

export function WorkshopGallery() {
  const images = [
    { 
      src: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200", 
      title: "Cellar Maceration & Demijohns",
      tag: "Aging Vault",
      colSpan: "col-span-1"
    },
    { 
      src: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200", 
      title: "Hand-Numbered Crystal Flacon Inspection",
      tag: "Flaconnerie",
      colSpan: "col-span-1 sm:col-span-2 md:col-span-2"
    },
    { 
      src: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1200", 
      title: "Botanical Distillation & Precious Resins",
      tag: "Raw Extracts",
      colSpan: "col-span-1"
    },
  ];

  return (
    <section className="relative py-14 md:py-20 bg-[#FAF8F5] text-neutral-900 border-t border-neutral-300/80 overflow-hidden selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* Subtle Pattern & Ambient Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#c5a265_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]" />
        <div className="absolute -right-20 top-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-amber-200/20 via-orange-100/15 to-transparent blur-[120px]" />
        <div className="absolute left-10 bottom-10 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-300/15 via-amber-100/20 to-transparent blur-[130px]" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Compact Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-xl">
            <SectionHeading 
              label="05 / The Laboratory"
              title="Inside the Perfumer’s Studio"
              className="mb-1"
            />
            <p className="text-neutral-600 font-light text-xs sm:text-sm md:text-base leading-relaxed">
              A private glimpse into our creative sanctuary where rare botanical absolutes, aged agarwood, and crystal glass unite.
            </p>
          </div>

          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-300/80 shadow-2xs self-start md:self-auto shrink-0">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-800">
              The Maison Atelier
            </span>
          </div>
        </div>

        {/* Balanced Grid with Controlled Card Height */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {images.map((img, i) => (
            <motion.div
              key={i}
              variants={galleryItemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-3xl border border-neutral-300/80 bg-neutral-900 shadow-sm transition-all duration-500 hover:border-amber-500/60 hover:shadow-xl h-[270px] sm:h-[310px] md:h-[350px] ${img.colSpan}`}
            >
              {/* Image Background */}
              <img 
                src={img.src} 
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter contrast-[1.03] brightness-[0.9]"
              />

              {/* Permanent Bottom Dark Gradient for High Contrast Text */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/30 to-transparent pointer-events-none" />

              {/* Top Tag Badge */}
              <div className="absolute top-3.5 left-3.5 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950/70 border border-white/20 backdrop-blur-md font-mono text-[10px] text-amber-300 tracking-wider uppercase font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {img.tag}
                </span>
              </div>

              {/* Caption Bar at Bottom */}
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <h4 className="font-serif text-base sm:text-lg md:text-xl text-white font-normal leading-snug drop-shadow-sm">
                  {img.title}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}