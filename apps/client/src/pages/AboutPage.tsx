import { motion } from "framer-motion";
import { Compass, Sparkles, Feather, Clock, Droplets, HeartHandshake, ShieldCheck, Flower2 } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";
import { useAttarSEO, ATTAR_SEO } from "@/lib/attar-seo";

const values = [
  {
    icon: Clock,
    title: "Attars First",
    description:
      "Concentrated, alcohol-free attar oils are our primary business — musk, oud, floral, fruity, woody, sweet, fresh and oriental families in 3–12ml sizes. Sprays play a supporting role.",
  },
  {
    icon: Droplets,
    title: "Established Import Houses",
    description:
      "We stock attars from known houses including Al-Nuaim, Al-Rehab and Adil Qadri. What is on the shelf is what the supplier lists — nothing invented, nothing relabeled.",
  },
  {
    icon: ShieldCheck,
    title: "Honest Shelves",
    description:
      "Every product page shows only its own sizes, each with its own price. Brand, family and wearer information comes from listed attributes, shown as-is.",
  },
];

export default function AboutPage() {
  useAttarSEO(ATTAR_SEO.about.title, ATTAR_SEO.about.desc, { canonical: "/about" });
  return (
    <div className="relative pt-36 lg:pt-40 pb-28 bg-[#FAF8F5] text-neutral-900 min-h-screen selection:bg-[#C5A265]/20 selection:text-neutral-900">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C5A265_0.6px,transparent_0.6px)] [background-size:28px_28px] opacity-15" />
        <div className="absolute -right-20 top-1/6 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#C5A265]/10 via-[#C5A265]/5 to-transparent blur-[140px]" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 max-w-5xl">
        
        {/* 1. HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16 pb-12 border-b border-neutral-200">
          
          {/* Main Title & Brand Identifier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/30 font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C6D37]">
              <Flower2 className="w-3.5 h-3.5 text-[#C5A265]" />
              <span>01 / Our Story</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-neutral-950 tracking-tight leading-none">
              The Story of <br />
              <span className="italic font-light text-[#8C6D37]">Attar House Nepal</span>
            </h1>

            {/* Brand Monogram Crest Pill */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/90 border border-[#C5A265]/30 shadow-xs backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-full border border-[#C5A265] bg-neutral-950 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/logo.png"
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="h-6 w-px bg-neutral-200" />
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A265] animate-pulse" />
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-800">
                  Attars · Oils · Sprays — Kathmandu, Nepal
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Dark Hero Quote Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="lg:col-span-5 relative p-8 sm:p-10 rounded-3xl bg-neutral-950 text-white shadow-2xl overflow-hidden min-h-[220px] flex items-center border border-neutral-800 transition-all duration-300"
          >
            <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-10 pointer-events-none">
              <Sparkles className="w-36 h-36 text-[#C5A265]" />
            </div>
            <p className="font-serif text-lg sm:text-xl text-neutral-200 italic leading-relaxed relative z-10">
              "A fragrance is an invisible couture garment, the quietest yet most unforgettable echo of human memory."
            </p>
          </motion.div>
        </div>

        {/* 2. NARRATIVE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 items-start">
          
          {/* Who We Are */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/20 font-mono text-[10px] text-[#8C6D37] tracking-wider uppercase font-medium">
                <Feather className="w-3.5 h-3.5 text-[#C5A265]" />
                The Origin
              </span>
            </div>

            <p className="text-base sm:text-lg text-neutral-900 font-normal leading-relaxed">
              Attar House Nepal is a Nepal-based importer and retailer of established attar houses.
              We bring attars from known fragrance brands to shoppers in Nepal — and sell them online
              with clear sizes and prices.
            </p>

            <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
              Our shelves focus on concentrated attar oils — musk, oud, floral, fruity, woody, sweet,
              fresh and oriental families — alongside a smaller selection of sprays. We do not
              manufacture attars; product details are shown as listed by our suppliers.
            </p>
          </motion.div>

          {/* Our Philosophy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -3 }}
            className="lg:col-span-5 p-7 sm:p-8 rounded-3xl border border-[#C5A265]/25 bg-white/90 backdrop-blur-sm space-y-3 shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A265]/15 border border-[#C5A265]/30 font-mono text-[10px] text-[#8C6D37] tracking-wider uppercase font-medium">
                <HeartHandshake className="w-3.5 h-3.5 text-[#C5A265]" />
                Our Philosophy
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-neutral-900 leading-snug">
              Quiet Oils, Honest Shelves
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
              Our ambition is never to overwhelm, but to enchant. Attar oils are worn close to the
              skin — a drop at a time — and every oil on our shelves lists only its own sizes,
              each honestly priced.
            </p>
          </motion.div>
        </div>

        {/* 3. FEATURE BLOCK: The Craft of Slow Perfumery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.005 }}
          className="p-8 sm:p-12 rounded-3xl bg-neutral-950 text-white shadow-2xl mb-16 relative overflow-hidden transition-all duration-300 border border-neutral-800"
        >
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A265]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#C5A265] font-semibold">The Creed</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal">
              Why We Sell Attars
            </h2>
            <p className="text-neutral-300 font-light text-sm sm:text-base leading-relaxed">
              A good attar needs no alcohol and no sprayer — just a drop of concentrated oil.
              We keep the focus narrow: known houses, clear families, honest sizes. If a detail
              is listed on a product page, that is what our supplier gave us — nothing added,
              nothing invented.
            </p>
          </div>
        </motion.div>

        {/* 4. FOUNDER & CORE ETHOS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Founder Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -3 }}
            className="lg:col-span-5 p-7 sm:p-8 rounded-3xl border border-neutral-200 bg-white/90 backdrop-blur-md shadow-sm space-y-3 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/20 font-mono text-[10px] text-[#8C6D37] tracking-wider uppercase font-medium">
                <Compass className="w-3.5 h-3.5 text-[#C5A265]" />
                Creative Direction
              </span>
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900">
                What We Do
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#8C6D37] font-semibold mt-0.5">
                Import · Shelve · Deliver
              </p>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed pt-2">
              We source attars from established fragrance houses, shelve them by family, brand and
              wearer, and deliver across Nepal. Questions about a product? Contact us and we will
              answer from what is actually listed — or find out for you.
            </p>
          </motion.div>

          {/* Core Values / Ethos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/20 font-mono text-[10px] text-[#8C6D37] tracking-wider uppercase font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A265]" />
                Guiding Principles
              </span>
            </div>
            <h2 className="font-serif text-2xl font-normal text-neutral-900">How We Work</h2>

            {/* Horizontal Rounded Ethos Cards */}
            <div className="space-y-3 pt-1">
              {values.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="p-5 sm:p-6 rounded-2xl border border-neutral-200 bg-white/90 shadow-2xs hover:border-[#C5A265]/50 hover:shadow-md transition-all duration-300 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/20 flex items-center justify-center text-[#8C6D37] shrink-0 mt-0.5">
                      <IconComponent className="w-5 h-5 text-[#C5A265]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}