/**
 * Seed attar taxonomy (ADDITIVE — never deletes).
 * Run locally only: pnpm --filter @workspace/db run db:seed:attar
 * Requires DATABASE_URL in lib/db/.env (your own DB, never prod).
 */
import { db } from "./index";
import { categoriesTable } from "./schema/categories";
import { collectionsTable } from "./schema/collections";

const ATTAR_CATEGORIES = [
  { name: "Floral Attars", slug: "floral-attars", description: "Gulab, Motia, Kevda — Kannauj petal distillation into sandalwood oil." },
  { name: "Oud & Hindi Oud", slug: "oud-hindi-oud", description: "Dehn al Oud, Hindi/Cambodi profiles — evenings and layering." },
  { name: "Musk Attars", slug: "musk-attars", description: "Tahara and white musk — clean, powdery, close-to-skin." },
  { name: "Woody & Sacred Woods", slug: "woody-sacred-woods", description: "Chandan, Khus, cedar — sandal base and cooling vetiver." },
  { name: "Amber & Resins", slug: "amber-resins", description: "Anbar, benzoin, labdanum, myrrh — winter and wedding warmth." },
  { name: "Herbal & Earthy", slug: "herbal-earthy", description: "Mitti, Heena, green — rain-earth and tea-like herbals." },
  { name: "Traditional Indian Attars", slug: "traditional-indian-attars", description: "Shamama, Kesar, Kannauj deg-bhapka heritage." },
  { name: "Mukhallat & Oriental Blends", slug: "mukhallat-oriental-blends", description: "Mukhallat, gourmand, fresh — oud-rose-amber blends + Dubai moderns." },
  { name: "Attar Oils", slug: "attar-oils", description: "Concentrated alcohol-free oils: 3ml, 5.5ml, 6ml, 8ml, 9ml, 9.9ml, 10ml, 12ml, 20ml." },
  { name: "Oriental Sprays", slug: "oriental-sprays", description: "EDP sprays 20ml, 50ml, 100ml — Khamrah, Hawas, 9PM and house blends." },
  { name: "Discovery Sets", slug: "discovery-sets", description: "2ml trial vials and curated discovery coffrets." },
];

const ATTAR_COLLECTIONS = [
  {
    name: "Hindi Heritage",
    slug: "hindi-heritage",
    description: "Kannauj deg-bhapka: gulab, motia, kevda, khus, mitti, chandan, shamama, kesar.",
    image: "",
    productCount: 0,
    featured: true,
  },
  {
    name: "Arabian Classic",
    slug: "arabian-classic",
    description: "Saudi ritual: dehn al oud, mukhallat, Tahara musk, amber, Taif rose.",
    image: "",
    productCount: 0,
    featured: true,
  },
  {
    name: "Dubai Modern Oriental",
    slug: "dubai-modern-oriental",
    description: "Concentrated oils, oud blends, gourmand and fresh orientals, discovery sets.",
    image: "",
    productCount: 0,
    featured: true,
  },
];

async function seedAttarTaxonomy() {
  console.log("Seeding attar taxonomy (additive, no deletes)...");
  for (const c of ATTAR_CATEGORIES) {
    await db.insert(categoriesTable).values(c).onConflictDoNothing({ target: categoriesTable.slug });
  }
  console.log(`Upserted ${ATTAR_CATEGORIES.length} categories.`);
  for (const c of ATTAR_COLLECTIONS) {
    await db.insert(collectionsTable).values(c).onConflictDoNothing({ target: collectionsTable.slug });
  }
  console.log(`Upserted ${ATTAR_COLLECTIONS.length} collections.`);
  console.log("Done. Verify in /admin → Catalog. No products were modified.");
  process.exit(0);
}

seedAttarTaxonomy().catch((e) => {
  console.error("Attar taxonomy seed failed:", e);
  process.exit(1);
});
