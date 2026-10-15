import { db } from "./index";
import { categoriesTable } from "./schema/categories";
import { productsTable } from "./schema/products";
import { collectionsTable, collectionProductsTable } from "./schema/collections";

const LUXURY_CATEGORIES = [
  {
    name: "Extrait de Parfum",
    slug: "extrait-de-parfum",
    description: "Highest concentration perfume formulations featuring 30-38% pure aromatic absolutes.",
  },
  {
    name: "Oud & Orientals",
    slug: "oud-orientals",
    description: "Sovereign extractions of aged Cambodian agarwood, frankincense, myrrh, and rare spices.",
  },
  {
    name: "Royal Florals",
    slug: "royal-florals",
    description: "Centifolia rose de Mai, jasmine grandiflorum, and tuberose harvested at dawn in Grasse.",
  },
  {
    name: "Amber & Resins",
    slug: "amber-resins",
    description: "Sensual ambergris tinctures, bourbon vanilla beans, and fossilized golden amber resins.",
  },
  {
    name: "Discovery Sets",
    slug: "discovery-sets",
    description: "Curated collections of 2ml trial vials in gold-embossed velvet presentation cases.",
  },
];

const LUXURY_COLLECTIONS = [
  {
    name: "The Noir Reserve",
    slug: "the-noir-reserve",
    description: "Opulent, nocturnal extraits blending smoky Cambodian agarwood, charred resins, dark roasted vanilla, and aged labdanum.",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1600&q=85",
    productCount: 3,
    featured: true,
  },
  {
    name: "The Sovereign Florals of Grasse",
    slug: "the-sovereign-florals",
    description: "Sublime botanical symphonies composed with hand-picked May Rose, luminous Jasmine Sambac, and velvety tuberose.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85",
    productCount: 3,
    featured: true,
  },
  {
    name: "The Amber & Oriental Archives",
    slug: "amber-oriental-archives",
    description: "Intimate and sensual creations radiating warmth, golden fossilized amber, rare spices, and velvety tonka bean.",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
    productCount: 2,
    featured: false,
  },
  {
    name: "The Luminary Botanicals",
    slug: "the-luminary-botanicals",
    description: "Bright, sun-drenched extractions featuring sparkling Calabrian bergamot, orange blossom, and crisp aromatic sage.",
    image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1600&q=85",
    productCount: 2,
    featured: false,
  },
];

const LUXURY_PRODUCTS = [
  {
    name: "Oud Royale Extrait",
    slug: "oud-royale-extrait",
    price: "420.00",
    compareAtPrice: "480.00",
    shortDescription: "A regal synthesis of 35-year wild Cambodian agarwood, Damascene rose, and black amber.",
    description: "Formulated for monarchs and connoisseurs, Oud Royale Extrait is macerated for 14 months in temperature-controlled darkness. Each numbered flacon contains a luminous concentration of natural agarwood oil harmonized with velvet spices.",
    category: "Oud & Orientals",
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80"],
    materials: ["Top: Saffron, Bergamot", "Heart: Taif Rose, Nutmeg", "Base: Cambodian Agarwood, Black Amber, Leather"],
    colors: ["50ml", "100ml", "200ml"],
    dimensions: "Extrait de Parfum (35%)",
    weight: "100ml / 3.4 fl. oz.",
    inStock: true,
    featured: true,
    tags: ["Oud", "Extrait de Parfum", "Nocturnal"],
  },
  {
    name: "Rose Impériale de Grasse",
    slug: "rose-imperiale-de-grasse",
    price: "360.00",
    compareAtPrice: "410.00",
    shortDescription: "A thousand petals of hand-harvested May Rose blended with sparkling pink pepper and white amber.",
    description: "Harvested at dawn in Grasse during the fleeting May bloom, this delicate floral nectar is heightened by crystalline bergamot and wrapped in clean musk and golden ambergris.",
    category: "Royal Florals",
    images: ["https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80"],
    materials: ["Top: Pink Pepper, Lychee, Mandarine", "Heart: Centifolia May Rose, Peony", "Base: White Amber, Cedar, Clean Musks"],
    colors: ["50ml", "100ml"],
    dimensions: "Extrait de Parfum (30%)",
    weight: "100ml / 3.4 fl. oz.",
    inStock: true,
    featured: true,
    tags: ["Floral", "Grasse Rose", "Extrait de Parfum"],
  },
  {
    name: "Santal Blanc Sensuel",
    slug: "santal-blanc-sensuel",
    price: "340.00",
    compareAtPrice: "390.00",
    shortDescription: "Creamy Mysore sandalwood bathed in white iris, cardamom, and warm cashmere.",
    description: "An intimate, skin-scent masterpiece. Pure sustainable Mysore sandalwood extract blended with gentle Tuscan iris root and creamy vanilla orchid for unparalleled tactile elegance.",
    category: "Extrait de Parfum",
    images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80"],
    materials: ["Top: Cardamom, Violet Leaf", "Heart: Tuscan Iris, Papyrus", "Base: Mysore Sandalwood, Cashmere, Vanilla Bean"],
    colors: ["50ml", "100ml", "200ml"],
    dimensions: "Extrait de Parfum (32%)",
    weight: "100ml / 3.4 fl. oz.",
    inStock: true,
    featured: true,
    tags: ["Sandalwood", "Creamy", "Signature"],
  },
  {
    name: "Velvet Amber Noir",
    slug: "velvet-amber-noir",
    price: "385.00",
    compareAtPrice: "440.00",
    shortDescription: "Smoky fossilized amber layered with roasted bourbon vanilla and dark labdanum.",
    description: "Deep, sensual, and hypnotic. Velvet Amber Noir wraps the wearer in an intoxicating embrace of golden benzoin resin, smoky birch, and Madagascar vanilla orchid.",
    category: "Amber & Resins",
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80"],
    materials: ["Top: Bitter Almond, Incense", "Heart: Benzoin Siam, Cinnamon Bark", "Base: Fossilized Amber, Madagascar Vanilla, Labdanum"],
    colors: ["50ml", "100ml"],
    dimensions: "Extrait de Parfum (34%)",
    weight: "100ml / 3.4 fl. oz.",
    inStock: true,
    featured: true,
    tags: ["Amber", "Gourmand", "Night"],
  },
  {
    name: "Soleil de Neroli",
    slug: "soleil-de-neroli",
    price: "295.00",
    compareAtPrice: "340.00",
    shortDescription: "Calabrian bergamot, solar neroli petals, and crystalline sea salt breeze.",
    description: "The essence of a sunlit morning along the Mediterranean coast. Sparkling citrus oils cold-pressed in Calabria combined with orange blossom and aquatic driftwood.",
    category: "Extrait de Parfum",
    images: ["https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=80"],
    materials: ["Top: Calabrian Bergamot, Petitgrain", "Heart: Tunisian Neroli, Orange Blossom", "Base: Vetiver, Sea Salt, White Cedar"],
    colors: ["50ml", "100ml"],
    dimensions: "Eau de Parfum Légère (25%)",
    weight: "100ml / 3.4 fl. oz.",
    inStock: true,
    featured: false,
    tags: ["Citrus", "Fresh", "Neroli"],
  },
  {
    name: "Fleur Blanche Éthérée",
    slug: "fleur-blanche-etheree",
    price: "350.00",
    compareAtPrice: "395.00",
    shortDescription: "Night-blooming Indian tuberose, Sambac jasmine, and solar coconut nectar.",
    description: "An intoxicating white floral bouquet captured under moonlit skies. Lush, creamy tuberose flowers steeped in white musk and warm golden amber.",
    category: "Royal Florals",
    images: ["https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1000&q=80"],
    materials: ["Top: Gardenia, Green Leaves", "Heart: Indian Tuberose, Jasmine Sambac", "Base: Coconut Nectar, White Musks"],
    colors: ["50ml", "100ml"],
    dimensions: "Extrait de Parfum (30%)",
    weight: "100ml / 3.4 fl. oz.",
    inStock: true,
    featured: false,
    tags: ["Tuberose", "White Floral", "Luminous"],
  },
  {
    name: "Cuir Ottoman Sublime",
    slug: "cuir-ottoman-sublime",
    price: "410.00",
    compareAtPrice: "460.00",
    shortDescription: "Supple leather softened by wild honey, tobacco leaf, and smoked frankincense.",
    description: "Inspired by imperial palace libraries, this rich leather fragrance pairs smoky aromatic herbs with smooth honeyed tobacco and ancient resinous incense.",
    category: "Oud & Orientals",
    images: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80"],
    materials: ["Top: Thyme, Saffron, Raspberry", "Heart: Olibanum, Night Jasmine", "Base: Suede Leather, Tobacco, Ambergris"],
    colors: ["50ml", "100ml", "200ml"],
    dimensions: "Extrait de Parfum (35%)",
    weight: "100ml / 3.4 fl. oz.",
    inStock: true,
    featured: false,
    tags: ["Leather", "Smoky", "Tobacco"],
  },
  {
    name: "Iris Noble Privé",
    slug: "iris-noble-prive",
    price: "450.00",
    compareAtPrice: "520.00",
    shortDescription: "Rare Florentine orris butter aged for six years, paired with powdery violet and ambrette.",
    description: "The crown jewel of our floral archives. Florentine Iris pallida root aged for six years to yield precious orris butter with powdery, aristocratic elegance.",
    category: "Royal Florals",
    images: ["https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1000&q=80"],
    materials: ["Top: Angelica Seeds, Carrot Seed", "Heart: Aged Orris Butter, Violet", "Base: Ambrette Seeds, White Amber, Suede"],
    colors: ["50ml", "100ml"],
    dimensions: "Extrait de Parfum (38%)",
    weight: "100ml / 3.4 fl. oz.",
    inStock: true,
    featured: true,
    tags: ["Orris", "Iris", "Royale"],
  },
];

async function seed() {
  console.log("Seeding Ayesha Fragrances luxury catalog...");

  console.log("1. Seeding categories...");
  await db.delete(categoriesTable);
  for (const cat of LUXURY_CATEGORIES) {
    await db.insert(categoriesTable).values(cat);
  }

  console.log("2. Seeding products...");
  await db.delete(productsTable);
  const insertedProducts: any[] = [];
  for (const prod of LUXURY_PRODUCTS) {
    const [p] = await db.insert(productsTable).values(prod as any).returning();
    insertedProducts.push(p);
  }

  console.log("3. Seeding collections...");
  await db.delete(collectionProductsTable);
  await db.delete(collectionsTable);
  for (const col of LUXURY_COLLECTIONS) {
    const [insertedCol] = await db.insert(collectionsTable).values(col).returning();
    if (insertedCol && insertedProducts.length > 0) {
      // Associate sample products with collection
      for (const prod of insertedProducts.slice(0, 3)) {
        await db.insert(collectionProductsTable).values({
          collectionId: insertedCol.id,
          productId: prod.id,
        });
      }
    }
  }

  console.log("Ayesha Fragrances catalog successfully seeded!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed Ayesha Fragrances catalog:", err);
  process.exit(1);
});