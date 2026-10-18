import { useMemo } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetCollection } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowLeft, Sparkles, Droplets } from "lucide-react";
import { FALLBACK_COLLECTIONS } from "./CollectionsPage";
import { FALLBACK_PERFUMES } from "./ShopPage";

export default function CollectionDetailPage() {
  const { slug } = useParams();

  const { data: apiCollection, isLoading } = useGetCollection(slug ?? "", {
    query: {
      queryKey: ["collection", slug],
      enabled: !!slug,
    },
  });

  const collection = useMemo(() => {
    if (apiCollection) return apiCollection;
    return FALLBACK_COLLECTIONS.find((c) => c.slug === slug);
  }, [apiCollection, slug]);

  const products = useMemo(() => {
    if (apiCollection && Array.isArray((apiCollection as any).products) && (apiCollection as any).products.length > 0) {
      return (apiCollection as any).products;
    }

    // Match appropriate fallback perfumes for each collection
    if (slug === "the-noir-reserve") {
      return FALLBACK_PERFUMES.filter((p) => ["oud-royale-extrait", "velvet-amber-noir", "cuir-ottoman-sublime"].includes(p.slug));
    }
    if (slug === "the-sovereign-florals") {
      return FALLBACK_PERFUMES.filter((p) => ["rose-imperiale-de-grasse", "fleur-blanche-etheree", "iris-noble-prive"].includes(p.slug));
    }
    if (slug === "amber-oriental-archives") {
      return FALLBACK_PERFUMES.filter((p) => ["velvet-amber-noir", "oud-royale-extrait", "santal-blanc-sensuel"].includes(p.slug));
    }
    if (slug === "the-luminary-botanicals") {
      return FALLBACK_PERFUMES.filter((p) => ["soleil-de-neroli", "santal-blanc-sensuel", "iris-noble-prive"].includes(p.slug));
    }

    return FALLBACK_PERFUMES.slice(0, 4);
  }, [apiCollection, slug]);

  if (isLoading && !collection) {
    return (
      <div className="pt-12 pb-24 bg-background text-foreground min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-3xl space-y-4 mb-12 animate-pulse">
            <div className="h-4 bg-border w-32 rounded-full" />
            <div className="h-10 bg-border w-2/3 rounded-lg" />
            <div className="h-5 bg-border w-full rounded" />
          </div>
          <div className="animate-pulse rounded-lg bg-border aspect-[21/9] w-full mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-neutral-200 aspect-square rounded-2xl w-full" />
                <div className="h-6 bg-neutral-200 w-3/4 rounded" />
                <div className="h-4 bg-neutral-200 w-1/3 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="relative pt-36 pb-24 bg-ivory min-h-screen flex flex-col items-center justify-center text-center px-6 selection:bg-brass/20 selection:text-neutral-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md p-10 rounded-xl border border-neutral-200 bg-white shadow-xl"
        >
          <div className="w-14 h-14 rounded-full bg-brass/10 border border-brass/30 flex items-center justify-center mx-auto mb-4 text-brass-deep">
            <Droplets className="h-6 w-6 text-brass" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-neutral-900 mb-3">
            Collection Not Found
          </h1>
          <p className="text-neutral-500 text-sm font-light mb-8 leading-relaxed">
            This olfactory collection does not exist or may have been archived into our private reserve.
          </p>
          <Link
            href="/collections"
            className="btn-primary shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collections
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-24 bg-background text-foreground min-h-screen">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-20 top-1/4 w-[650px] h-[650px] rounded-full bg-brass/10 blur-[140px]" />
        <div className="absolute left-10 bottom-20 w-[500px] h-[500px] rounded-full bg-sand/60 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#B79A62_0.6px,transparent_1px)] [background-size:28px_28px] opacity-15" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-7xl">
        
        {/* Navigation Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-brass-deep transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Collections
          </Link>
        </motion.div>

        {/* Collection Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-brass/10 border border-brass/30 font-mono text-[10px] text-brass-deep tracking-[0.25em] uppercase mb-4">
            <Sparkles className="w-3 h-3 text-brass" />
            <span>Maison Anthology</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950 mb-4">
            {collection.name}
          </h1>

          {collection.description && (
            <p className="text-neutral-600 text-base md:text-lg font-light leading-relaxed">
              {collection.description}
            </p>
          )}
        </motion.div>

        {/* Hero Cover Image */}
        {collection.image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative overflow-hidden rounded-xl border border-neutral-200 aspect-[16/9] md:aspect-[21/9] mb-16 shadow-xl"
          >
            <img
              src={collection.image}
              alt={collection.name}
              className="w-full h-full object-cover filter contrast-[1.03] brightness-[0.88]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-brass">
                Attar House Nepal • Exclusive Formulations
              </span>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-4">
            <h2 className="font-serif text-2xl font-normal text-neutral-900">
              Flacons in This Anthology
            </h2>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              {products.length} {products.length === 1 ? "Creation" : "Creations"}
            </span>
          </div>

          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-24 text-center rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md shadow-sm"
            >
              <div className="w-14 h-14 rounded-full bg-brass/10 border border-brass/20 flex items-center justify-center mx-auto mb-4 text-brass-deep">
                <Droplets className="h-6 w-6 text-brass" />
              </div>
              <h3 className="font-serif text-2xl font-normal text-neutral-900 mb-2">
                No Flacons in This Collection Yet
              </h3>
              <p className="text-neutral-500 text-sm font-light">
                Our Master Perfumer is currently formulating additions for this series.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}