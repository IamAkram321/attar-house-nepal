import { Link } from "wouter";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Droplets } from "lucide-react";

const faqs = [
  {
    category: "Attar Guide · अत्तर मार्गदर्शन",
    items: [
      {
        q: "Attar vs perfume — what is the difference? (अत्तर र पर्फ्युममा के फरक छ?)",
        a: "General guidance: attars are concentrated, alcohol-free oils applied by the drop to pulse points; perfumes/sprays use alcohol to project. Oils wear close to the skin; sprays project more. Per-product details are as listed — contact us before purchase if anything is unclear.",
      },
      {
        q: "What sizes do attars come in? (कुन साइजमा पाइन्छ?)",
        a: "General: houses commonly sell 3ml, 5.5ml, 6ml, 8ml, 9ml, 9.9ml, 10ml, 12ml, and 20ml oils, plus 100ml sprays and 5x2ml discovery sets. Each product page lists its sizes as currently stocked — confirm availability before ordering.",
      },
      {
        q: "How do I apply attar oil? (अत्तर कसरी लगाउने?)",
        a: "Warm one drop, dab on wrists, behind ears, or beard ends — do not rub harshly. Layer oil first, then spray if desired. Fresh and floral for day and prayer; oud, amber, and mukhallat for evening and weddings. Patch-test first; stop if irritation occurs.",
      },
      {
        q: "How long does attar last? (कति समय टिक्छ?)",
        a: "General guidance only: oils typically wear longer close to the skin than lighter sprays — actual wear varies by skin, climate and amount applied. We make no per-product hour promises.",
      },
      {
        q: "Are origins and notes verified? (उत्पत्ति प्रमाणित हो?)",
        a: "All product details — brand, fragrance family, gender, and sizes — are listed exactly as provided by our supplier partners. We curate and present them transparently so you can shop with confidence.",
      },
    ],
  },
  {
    category: "Our Shop & Products",
    items: [
      {
        q: "Do you make your own attars?",
        a: "No. Attar House Nepal is an importer and retailer of established attar houses such as Al-Nuaim, Al-Rehab and Adil Qadri. Concentration, sizes and notes are shown per product exactly as listed.",
      },
      {
        q: "How should I choose my first attar?",
        a: "Start with a fragrance family you already enjoy — musk and fresh oils for daytime, oud and amber for evenings. Each product page shows its family, wearer lane and available sizes to help you decide.",
      },
      {
        q: "Are attars for men, women, or everyone?",
        a: "Many attars are worn by everyone. Each product page shows For Him, For Her or Unisex where listed, and our Unisex shelf gathers oils wearable by all.",
      },
    ],
  },
  {
    category: "Gifting & Discovery",
    items: [
      {
        q: "Do you offer discovery sets?",
        a: "Discovery sets appear in the catalogue where available — they let you try several attars before choosing a full-size oil. Sizes, lineup and pricing are shown on each discovery product page.",
      },
    ],
  },
  {
    category: "Flacon Care & Delivery",
    items: [
      {
        q: "How should I store my perfume flacon?",
        a: "To preserve volatile natural essences, store your flacon upright in a cool, dry environment away from direct sunlight, ideally within its presentation coffret. Avoid storing bottles in high-humidity bathrooms.",
      },
      {
        q: "How are fragile flacons shipped?",
        a: "All orders are dispatched in custom climate-insulated security packaging with velvet-lined protective foam and tamper-evident wax seals, delivered via white-glove insured couriers.",
      },
      {
        q: "What payment methods are supported?",
        a: "We support direct bank QR transfer (with instant transaction verification) and Cash on Delivery (COD) for selected regional patrons.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="relative pt-36 lg:pt-40 pb-28 md:pb-36 bg-[#FAF8F5] text-neutral-900 min-h-screen overflow-hidden selection:bg-[#C5A265]/20 selection:text-neutral-900">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C5A265_0.6px,transparent_0.6px)] [background-size:28px_28px] opacity-15" />
        <div className="absolute -right-20 top-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#C5A265]/15 via-transparent to-transparent blur-[140px]" />
        <div className="absolute -left-20 bottom-10 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#C5A265]/10 via-[#C5A265]/5 to-transparent blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 max-w-4xl">
        
        {/* Header Section */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/30 font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C6D37] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A265]" />
            <span>Patron Advisory</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-neutral-950 tracking-tight leading-tight">
            The Fragrance Guide & <br />
            <span className="italic font-light text-[#8C6D37]">Frequently Asked Questions</span>
          </h1>
          <p className="mt-3 text-neutral-600 font-light text-base leading-relaxed">
            Attar oils, layering ritual, sizes, and store visits — plus Maison services below.
            Heritage answers describe general traditions; per-product claims need owner confirmation.
          </p>
          <div className="mt-4">
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[#8C6D37] font-semibold hover:text-neutral-950 transition-colors group"
            >
              <span>Have a private inquiry? Contact the Concierge</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* FAQ Categories Stack */}
        <div className="space-y-12">
          {faqs.map((section, sectionIdx) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: sectionIdx * 0.1 }}
              className="p-8 sm:p-10 rounded-3xl border border-neutral-200 bg-white/95 backdrop-blur-md shadow-xl"
            >
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-neutral-100">
                <Droplets className="w-4 h-4 text-[#C5A265]" />
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900">
                  {section.category}
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <AccordionItem
                    key={itemIdx}
                    value={`item-${sectionIdx}-${itemIdx}`}
                    className="border-b border-neutral-100 last:border-b-0 pb-2"
                  >
                    <AccordionTrigger className="font-serif text-lg sm:text-xl font-normal text-neutral-900 hover:text-[#8C6D37] text-left transition-colors py-3">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm font-light text-neutral-600 leading-relaxed pt-1 pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}