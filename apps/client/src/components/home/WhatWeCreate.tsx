import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { Link } from 'wouter';
import { ArrowUpRight, Sparkles, Droplet, Flame, Flower2 } from 'lucide-react';

const categories = [
  {
    tag: "01 / Regal & Enigmatic",
    title: "Extrait de Parfum",
    description: "Concentrated at 30%+ pure perfume oil, our extraits deliver commanding presence and intoxicating 12+ hour longevity.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200",
    link: "/shop?category=Extrait+de+Parfum",
    colSpan: "col-span-1 md:col-span-2",
    icon: Droplet
  },
  {
    tag: "02 / Precious Resins",
    title: "Oud & Orientals",
    description: "Rare Cambodian and Assamese agarwood steeped with golden ambergris, frankincense, and warm spices.",
    image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1200",
    link: "/shop?category=Oud+%26+Orientals",
    colSpan: "col-span-1",
    icon: Flame
  },
  {
    tag: "03 / Grasse Blossoms",
    title: "Floral & Botanicals",
    description: "Centifolia rose, midnight jasmine grandiflorum, and delicate Florentine iris butter harvested at dawn.",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1200",
    link: "/shop?category=Floral+%26+Botanical",
    colSpan: "col-span-1",
    icon: Flower2
  }
];

export function WhatWeCreate() {
  return (
    <section className="relative py-16 md:py-24 bg-[#FAF8F5] text-neutral-900 border-y border-neutral-300/80 overflow-hidden selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* Blueprint Grid & Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#c5a265_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]" />
        <div className="absolute -right-20 top-1/3 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-200/20 via-orange-100/15 to-transparent blur-[140px]" />
        <div className="absolute left-10 bottom-10 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-amber-300/15 via-amber-100/20 to-transparent blur-[140px]" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Sticky Editorial Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
            <SectionHeading 
              label="02 / Olfactive Families"
              title="Signature Pillars"
              className="mb-2"
            />
            
            <p className="text-neutral-600 text-sm sm:text-base font-light leading-relaxed max-w-md">
              Each fragrance at Attar House Nepal belongs to an intentional olfactory realm—blended without compromise using the finest wild-harvested botanicals and aged resinous woods.
            </p>

            <div className="pt-2">
              <Link 
                href="/shop" 
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 shadow-md transition-all duration-300 font-mono text-xs font-semibold uppercase tracking-widest cursor-pointer"
              >
                <span>Explore The Collection</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </Link>
            </div>
          </div>
          
          {/* Bento Gallery Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Link key={category.title} href={category.link} className={`group block ${category.colSpan}`}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="relative overflow-hidden rounded-3xl border border-neutral-300/80 bg-neutral-900 shadow-sm transition-all duration-500 group-hover:border-amber-500/60 group-hover:shadow-xl h-[310px] sm:h-[330px] md:h-[360px]"
                    >
                      {/* Background Image with Dynamic Zoom */}
                      <img 
                        src={category.image} 
                        alt={category.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter contrast-[1.03] brightness-[0.88]"
                      />

                      {/* Dark Gradient Overlay for Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/45 to-transparent transition-opacity duration-500 opacity-80 group-hover:opacity-90" />
                      
                      {/* Top Category Tag Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950/70 border border-white/20 backdrop-blur-md font-mono text-[10px] text-amber-300 tracking-wider uppercase font-medium">
                          <IconComponent className="w-3 h-3 text-amber-400" />
                          {category.tag}
                        </span>
                      </div>

                      {/* Bottom Content Box */}
                      <div className="absolute inset-0 p-6 md:p-7 flex flex-col justify-end z-20">
                        <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                          
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight group-hover:text-amber-200 transition-colors duration-300">
                              {category.title}
                            </h3>

                            {/* Hover Arrow Badge */}
                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-amber-600 group-hover:border-amber-500 text-white transition-all duration-300 transform -translate-x-1 group-hover:translate-x-0 shrink-0">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <p className="text-neutral-300 font-light text-xs sm:text-sm leading-relaxed max-w-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                            {category.description}
                          </p>

                        </div>
                      </div>

                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}