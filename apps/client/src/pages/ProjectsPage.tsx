import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Compass, Sparkles, SlidersHorizontal, Droplets, Feather } from "lucide-react";

export interface ArchiveCommission {
  title: string;
  slug: string;
  description: string;
  images: string[];
  tags: string[];
  client: string;
  year: string;
  featured: boolean;
  specs: { label: string; value: string }[];
}

export const ARCHIVE_COMMISSIONS: ArchiveCommission[] = [
  {
    title: "The Royal Mirage Flacon",
    slug: "the-royal-mirage-flacon",
    description: "A private sovereign commission blending 45-year aged Cambodian agarwood, wild ambergris tincture, and Taif rose, housed in hand-carved black obsidian crystal with 24K gold foil inlay.",
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80"],
    tags: ["Private Commissions", "Haute Flaconnerie"],
    client: "Royal House of Al-Mirage",
    year: "2025",
    featured: true,
    specs: [
      { label: "Concentration", value: "38% Pure Extrait de Parfum" },
      { label: "Maceration Duration", value: "14 Months Cold Vault" },
      { label: "Flacon Vessel", value: "Hand-Carved Black Obsidian Crystal" },
      { label: "Edition", value: "Single Private Edition (1 of 1)" },
    ],
  },
  {
    title: "Symphonie de Grasse",
    slug: "symphonie-de-grasse",
    description: "An archival tribute to the May harvest in Grasse. Five thousand hand-harvested centifolia petals distilled per flacon, sealed with silk thread and gold wax.",
    images: ["https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80"],
    tags: ["Botanical Expeditions", "Haute Flaconnerie"],
    client: "Grasse Heritage Guild",
    year: "2024",
    featured: false,
    specs: [
      { label: "Concentration", value: "32% Extrait de Parfum" },
      { label: "Maceration Duration", value: "9 Months" },
      { label: "Flacon Vessel", value: "Weighted French Baccarat Crystal" },
      { label: "Edition", value: "Numbered Vault Run (25 Flacons)" },
    ],
  },
  {
    title: "Amber & Suede Privée",
    slug: "amber-and-suede-privee",
    description: "Formulated for an international gala evening — dark Russian leather accords, melted fossilized amber, and rare Venezuelan tonka bean encased in smoked crystal.",
    images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80"],
    tags: ["Private Commissions", "Royal Bespoke"],
    client: "Lord & Lady Kensington",
    year: "2025",
    featured: false,
    specs: [
      { label: "Concentration", value: "35% Extrait de Parfum" },
      { label: "Maceration Duration", value: "11 Months" },
      { label: "Flacon Vessel", value: "Smoked French Amber Glass" },
      { label: "Edition", value: "Private Heirloom Batch (5 Flacons)" },
    ],
  },
  {
    title: "The Sovereign Cask Reserve",
    slug: "the-sovereign-cask-reserve",
    description: "A single-cask private reserve aged in French oak barrels for 24 months before decanting into individually numbered 250ml crystal carafes.",
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80"],
    tags: ["Royal Bespoke", "Botanical Expeditions"],
    client: "Private Sovereign Vault",
    year: "2024",
    featured: true,
    specs: [
      { label: "Concentration", value: "40% Pure Extrait" },
      { label: "Maceration Duration", value: "24 Months in Limousin Oak" },
      { label: "Flacon Vessel", value: "250ml Carafe with Gold Seal" },
      { label: "Edition", value: "Vault Archive (12 Numbered Decanters)" },
    ],
  },
];

export default function ProjectsPage() {
  const [activeTag, setActiveTag] = useState<string>("All");

  // Static attar journal — intentionally NOT fetching backend /projects.
  // The old 3D-printing projects table caused the "perfumes then swapping" flicker.
  const rawProjects = ARCHIVE_COMMISSIONS;

  // Extract unique tags for filter tabs
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>(["All"]);
    rawProjects.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [rawProjects]);

  // Filter projects by selected tag
  const filteredProjects = useMemo(() => {
    if (activeTag === "All") return rawProjects;
    return rawProjects.filter((p) => p.tags?.includes(activeTag));
  }, [rawProjects, activeTag]);

  return (
    <div className="relative pt-36 pb-32 md:pb-40 bg-[#FAF8F5] text-neutral-900 min-h-screen overflow-hidden selection:bg-[#C5A265]/20 selection:text-neutral-900">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C5A265_0.6px,transparent_0.6px)] [background-size:28px_28px] opacity-15" />
        <div className="absolute -right-20 top-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#C5A265]/15 via-transparent to-transparent blur-[140px]" />
        <div className="absolute left-10 bottom-20 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#C5A265]/10 via-[#C5A265]/5 to-transparent blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-7xl">
        
        {/* Header & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-neutral-200 pb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/30 font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C6D37] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A265]" />
              <span>The Olfactive Archive</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-neutral-950 tracking-tight leading-tight">
              Attar Journal & <br />
              <span className="italic font-light text-[#8C6D37]">Olfactive Vaults</span>
            </h1>
            <p className="mt-3 text-neutral-600 text-sm md:text-base font-light leading-relaxed max-w-xl">
              A curated archive of private sovereign formulations, numbered decanters, and rare botanical expeditions curated by <strong className="font-medium text-neutral-900">Attar House Nepal</strong>.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-2xl border border-neutral-200 rounded-full shadow-xs self-start md:self-auto overflow-x-auto max-w-full">
            <span className="px-3 py-1.5 text-neutral-400 font-mono text-[10px] uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#C5A265]" /> Filter:
            </span>
            {allTags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "bg-neutral-950 text-white font-medium shadow-sm"
                      : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Commissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => {
              const imageSrc =
                Array.isArray(project.images) && project.images.length > 0
                  ? project.images[0]
                  : "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80";

              return (
                <motion.div
                  key={project.slug || project.title}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link href={`/projects/${project.slug}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-neutral-950 border border-neutral-200 shadow-md group-hover:border-[#C5A265]/60 group-hover:shadow-2xl transition-all duration-500">
                      <img
                        src={imageSrc}
                        alt={project.title}
                        className="w-full h-full object-cover filter contrast-[1.03] brightness-[0.88] transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                        <div className="flex flex-wrap gap-2">
                          {(project.tags || []).slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-neutral-900/80 border border-white/15 backdrop-blur-md font-mono text-[9px] uppercase tracking-widest text-[#C5A265]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <span className="font-mono text-[10px] text-white/50 tracking-widest uppercase">
                          ARCHIVE / 0{index + 1}
                        </span>
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute bottom-6 left-6 right-6 z-10">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal group-hover:text-[#F3E7D3] transition-colors">
                              {project.title}
                            </h3>
                            <p className="mt-1 text-xs text-neutral-300 font-light line-clamp-2 max-w-md">
                              {project.description}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:bg-[#C5A265] group-hover:border-[#C5A265] text-white transition-all transform group-hover:scale-105 shrink-0 shadow-sm">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* CTA to Shop */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-neutral-950 text-white text-center border border-neutral-800 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#C5A265]">
              From the Vault to Your Skin
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white">
              Explore the Attar Collection
            </h2>
            <p className="text-neutral-400 font-light text-sm leading-relaxed">
              Floral, oud, musk, and amber oils in 6ml–12ml, plus discovery sets to try every family at home.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C5A265] text-neutral-950 font-mono text-xs uppercase tracking-widest font-semibold hover:bg-white transition-all duration-300 shadow-lg"
              >
                <span>Shop Attars</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}