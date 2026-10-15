import { useMemo } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Sparkles, Feather, Droplets } from "lucide-react";
import { ARCHIVE_COMMISSIONS } from "./ProjectsPage";

export default function ProjectDetailPage() {
  const { slug } = useParams();

  // Static lookup — no backend /projects fetch (avoids 3D-printing rows leaking in).
  const project = useMemo(() => {
    return ARCHIVE_COMMISSIONS.find((c) => c.slug === slug) || ARCHIVE_COMMISSIONS[0];
  }, [slug]);

  const isLoading = false;

  if (isLoading && !project) {
    return (
      <div className="pt-36 pb-24 bg-[#FAF8F5] min-h-screen">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="max-w-3xl space-y-4 mb-12 animate-pulse">
            <div className="h-4 bg-neutral-200 w-32 rounded-full" />
            <div className="h-12 bg-neutral-200 w-3/4 rounded-lg" />
            <div className="h-5 bg-neutral-200 w-full rounded" />
          </div>
          <div className="animate-pulse rounded-3xl bg-neutral-200 aspect-[21/9] w-full mb-12" />
        </div>
      </div>
    );
  }

  const images = Array.isArray(project.images) && project.images.length > 0
    ? project.images
    : ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80"];

  const specs = project.specs || [
    { label: "Concentration", value: "35% Pure Extrait de Parfum" },
    { label: "Maceration Duration", value: "12 Months in Dark Vault" },
    { label: "Flacon Vessel", value: "Hand-Blown Weighted Crystal" },
    { label: "Edition", value: "Private Numbered Vault Archive" },
  ];

  return (
    <div className="relative pt-36 pb-28 md:pb-36 bg-[#FAF8F5] text-neutral-900 min-h-screen overflow-hidden selection:bg-[#C5A265]/20 selection:text-neutral-900">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-20 top-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#C5A265]/15 via-transparent to-transparent blur-[140px]" />
        <div className="absolute left-10 bottom-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#C5A265]/10 via-[#C5A265]/5 to-transparent blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#C5A265_0.6px,transparent_0.6px)] [background-size:28px_28px] opacity-15" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-7xl">
        
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-[#8C6D37] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Olfactive Archive
          </Link>
        </motion.div>

        {/* Title & Editorial Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8 space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              {(project.tags || ["Archive Commission"]).map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/30 font-mono text-[10px] text-[#8C6D37] tracking-wider uppercase"
                >
                  <Sparkles className="w-3 h-3 text-[#C5A265]" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950">
              {project.title}
            </h1>

            <p className="text-neutral-600 text-base md:text-lg font-light leading-relaxed pt-2">
              {project.description}
            </p>
          </motion.div>

          {/* Metadata Specs Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-4 p-8 rounded-3xl bg-white/90 backdrop-blur-2xl border border-neutral-200 shadow-xl space-y-6"
          >
            <div className="border-b border-neutral-200 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C6D37] font-semibold">
                Archival Specifications
              </span>
              <p className="font-serif text-xl font-normal text-neutral-900 mt-1">
                Attar House Nepal Vault
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <span className="text-neutral-400 uppercase tracking-wider">Patron / House</span>
                <span className="text-neutral-900 font-medium">{project.client || "Private Sovereign Client"}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2">
                <span className="text-neutral-400 uppercase tracking-wider">Vintage Year</span>
                <span className="text-neutral-900 font-medium">{project.year || "2025"}</span>
              </div>
              {specs.map((s, idx) => (
                <div key={idx} className="flex justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-400 uppercase tracking-wider">{s.label}</span>
                  <span className="text-[#8C6D37] font-medium text-right">{s.value}</span>
                </div>
              ))}
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-full bg-neutral-950 text-white font-mono text-xs uppercase tracking-widest hover:bg-[#C5A265] transition-all shadow-md"
            >
              Ask the Concierge
            </Link>
          </motion.div>
        </div>

        {/* Gallery / Image Showcase */}
        <div className="space-y-8">
          {images.map((imgUrl: string, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-neutral-200 aspect-[16/9] shadow-2xl"
            >
              <img
                src={imgUrl}
                alt={`${project.title} detail ${idx + 1}`}
                className="w-full h-full object-cover filter contrast-[1.03] brightness-[0.9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C5A265]">
                  Plate 0{idx + 1} • Olfactive Archive Inspection
                </span>
                <span className="font-mono text-[10px] text-white/60 uppercase">
                  Attar House Nepal
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}