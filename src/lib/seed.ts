import mongoose, { Types } from "mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { connectToDatabase } from "@/lib/mongodb";
import { slugifyProductName } from "@/lib/product-service";

const categories = {
  electronics: { id: "650000000000000000000001", name: "Electronics" },
  fashion: { id: "650000000000000000000002", name: "Fashion" },
  shoes: { id: "650000000000000000000003", name: "Shoes" },
  watches: { id: "650000000000000000000004", name: "Watches" },
  accessories: { id: "650000000000000000000005", name: "Accessories" },
  home: { id: "650000000000000000000006", name: "Home" },
  sports: { id: "650000000000000000000007", name: "Sports" },
  beauty: { id: "650000000000000000000008", name: "Beauty" },
} as const;

type CategorySlug = keyof typeof categories;

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  comparePrice: number;
  photo: string;
  additionalPhotos?: string[];
  category: CategorySlug;
  brand: string;
  sku: string;
  stock: number;
  rating: number;
  numReviews: number;
  featured: boolean;
  variants?: Array<{ name: string; options: string[] }>;
  specifications?: Record<string, string>;
}

const seedProducts: SeedProduct[] = [
  { name: "MacBook Air 13-inch M3", description: "A lightweight aluminum laptop with Apple's M3 chip, a vivid Liquid Retina display, and all-day battery life for work and travel.", price: 1099, comparePrice: 1199, photo: "photo-1517336714731-489689fd1ca8", additionalPhotos: ["photo-1496181133206-80ce9b88a853"], category: "electronics", brand: "Apple", sku: "APL-MBA-M3-13", stock: 18, rating: 4.8, numReviews: 284, featured: true, variants: [{ name: "Memory", options: ["8 GB", "16 GB", "24 GB"] }, { name: "Color", options: ["Midnight", "Starlight", "Silver"] }], specifications: { Display: "13.6-inch Liquid Retina", Processor: "Apple M3", Battery: "Up to 18 hours" } },
  { name: "iPhone 15 128GB", description: "A 6.1-inch Super Retina XDR phone with a 48MP main camera, Dynamic Island, and USB-C charging in a durable color-infused design.", price: 699, comparePrice: 799, photo: "photo-1592750475338-74b7b21085ab", category: "electronics", brand: "Apple", sku: "APL-IP15-128", stock: 26, rating: 4.7, numReviews: 512, featured: true, variants: [{ name: "Color", options: ["Black", "Blue", "Green", "Pink"] }] },
  { name: "WH-1000XM5 Wireless Headphones", description: "Comfortable over-ear headphones with industry-leading noise cancellation, clear hands-free calls, and up to 30 hours of listening time.", price: 328, comparePrice: 399, photo: "photo-1505740420928-5e560c06d30e", category: "electronics", brand: "Sony", sku: "SNY-WH1000XM5", stock: 31, rating: 4.8, numReviews: 926, featured: true, specifications: { Battery: "Up to 30 hours", Connectivity: "Bluetooth 5.2", Weight: "250 g" } },
  { name: "Nintendo Switch OLED", description: "A versatile handheld and home console with a 7-inch OLED screen, enhanced audio, and a wide adjustable stand.", price: 349, comparePrice: 349, photo: "photo-1493711662062-fa541dadf3fc", category: "electronics", brand: "Nintendo", sku: "NIN-SW-OLED", stock: 12, rating: 4.9, numReviews: 1104, featured: false },
  { name: "501 Original Fit Jeans", description: "Levi's signature straight-leg denim with a button fly, classic five-pocket construction, and a durable mid-weight cotton feel.", price: 69, comparePrice: 98, photo: "photo-1542272604-787c3835535d", category: "fashion", brand: "Levi's", sku: "LEV-501-ORIG", stock: 42, rating: 4.5, numReviews: 338, featured: true, variants: [{ name: "Waist", options: ["30", "32", "34", "36"] }, { name: "Length", options: ["30", "32", "34"] }] },
  { name: "Oxford Cloth Button-Down Shirt", description: "A crisp, versatile cotton Oxford shirt with a button-down collar, chest pocket, and an easy fit for workdays and weekends.", price: 49, comparePrice: 59, photo: "photo-1598033129183-c4f50c736f10", category: "fashion", brand: "J.Crew", sku: "JCR-OXF-BD-01", stock: 35, rating: 4.4, numReviews: 172, featured: false, variants: [{ name: "Color", options: ["White", "Blue", "Pink"] }, { name: "Size", options: ["S", "M", "L", "XL"] }] },
  { name: "Better Sweater Fleece Jacket", description: "A warm, low-bulk fleece jacket made with recycled polyester, finished with a full front zip and practical handwarmer pockets.", price: 139, comparePrice: 159, photo: "photo-1551028719-00167b16eac5", category: "fashion", brand: "Patagonia", sku: "PAT-BS-FLC-01", stock: 19, rating: 4.7, numReviews: 246, featured: true, variants: [{ name: "Size", options: ["S", "M", "L", "XL"] }] },
  { name: "Day Market Tote", description: "A structured leather tote designed for everyday carry, with a spacious interior, secure magnetic closure, and reinforced handles.", price: 178, comparePrice: 198, photo: "photo-1548036328-c9fa89d128fa", category: "fashion", brand: "Everlane", sku: "EVR-DAY-TOTE", stock: 14, rating: 4.3, numReviews: 91, featured: false },
  { name: "Pegasus 41 Road Running Shoes", description: "Responsive daily trainers with springy cushioning, a breathable engineered mesh upper, and dependable road traction.", price: 140, comparePrice: 140, photo: "photo-1542291026-7eec264c27ff", category: "shoes", brand: "Nike", sku: "NKE-PEG41-RUN", stock: 28, rating: 4.6, numReviews: 403, featured: true, variants: [{ name: "Size", options: ["7", "8", "9", "10", "11", "12"] }, { name: "Color", options: ["Black", "White", "Blue"] }] },
  { name: "Samba OG Leather Sneakers", description: "An indoor-football classic with a smooth leather upper, suede T-toe overlay, and grippy gum rubber outsole.", price: 100, comparePrice: 100, photo: "photo-1542291026-7eec264c27ff", category: "shoes", brand: "Adidas", sku: "ADD-SAMBA-OG", stock: 22, rating: 4.5, numReviews: 587, featured: true, variants: [{ name: "Size", options: ["6", "7", "8", "9", "10", "11"] }] },
  { name: "Clifton 9 Running Shoes", description: "Lightweight cushioned road shoes with a smooth rocker profile and breathable knit upper for everyday miles.", price: 145, comparePrice: 145, photo: "photo-1495555961986-6d4c1ecb7be3", category: "shoes", brand: "HOKA", sku: "HOK-CLIFTON9", stock: 16, rating: 4.6, numReviews: 211, featured: false, variants: [{ name: "Size", options: ["7", "8", "9", "10", "11"] }] },
  { name: "1460 Smooth Leather Boots", description: "The original eight-eye boot, built from smooth leather with signature yellow stitching, grooved sides, and an air-cushioned sole.", price: 170, comparePrice: 180, photo: "photo-1608256246200-53e635b5b65f", category: "shoes", brand: "Dr. Martens", sku: "DRM-1460-SMTH", stock: 11, rating: 4.7, numReviews: 309, featured: false },
  { name: "5 Sports Automatic Watch SRPD55", description: "A stainless-steel automatic sports watch with a day-date display, rotating bezel, and a clear hardlex crystal.", price: 275, comparePrice: 295, photo: "photo-1523275335684-37898b6baf30", category: "watches", brand: "Seiko", sku: "SEI-SRPD55-AUTO", stock: 9, rating: 4.8, numReviews: 147, featured: true, specifications: { Movement: "Automatic 4R36", Case: "42.5 mm stainless steel", WaterResistance: "100 m" } },
  { name: "G-Shock DW-5600E Digital Watch", description: "A shock-resistant digital watch with a stopwatch, countdown timer, alarm, and 200-meter water resistance.", price: 54, comparePrice: 69, photo: "photo-1524805444758-089113d48a6d", category: "watches", brand: "Casio", sku: "CAS-DW5600E", stock: 38, rating: 4.7, numReviews: 722, featured: false },
  { name: "Forerunner 265 GPS Running Watch", description: "A GPS running watch with a bright AMOLED display, training readiness insights, and detailed recovery guidance.", price: 449, comparePrice: 449, photo: "photo-1508685096489-7aacd43bd3b1", category: "watches", brand: "Garmin", sku: "GAR-FR265-GPS", stock: 13, rating: 4.6, numReviews: 184, featured: true },
  { name: "Slim Sleeve Leather Wallet", description: "A compact premium-leather wallet with quick-access card slots, a pull-tab section, and a slim profile for front-pocket carry.", price: 89, comparePrice: 99, photo: "photo-1627123424574-724758594e93", category: "accessories", brand: "Bellroy", sku: "BEL-SLIM-SLV", stock: 27, rating: 4.5, numReviews: 118, featured: false },
  { name: "737 Power Bank 24000mAh", description: "A high-capacity portable charger with a smart digital display and fast USB-C output for laptops, tablets, and phones.", price: 109, comparePrice: 149, photo: "photo-1609091839311-d5365f9ff1c5", category: "accessories", brand: "Anker", sku: "ANK-737-PB24", stock: 33, rating: 4.7, numReviews: 356, featured: true, specifications: { Capacity: "24,000 mAh", Output: "140 W USB-C", Ports: "2 USB-C, 1 USB-A" } },
  { name: "Original Wayfarer Classic", description: "A timeless acetate frame with signature rivets, comfortable temples, and high-quality UV-protective lenses.", price: 163, comparePrice: 193, photo: "photo-1511499767150-a48a237f0083", category: "accessories", brand: "Ray-Ban", sku: "RBN-WAYF-ORIG", stock: 15, rating: 4.6, numReviews: 273, featured: false },
  { name: "Wide Mouth Bottle 32 oz", description: "A durable insulated stainless-steel bottle that keeps drinks cold for hours, with a leak-resistant wide-mouth cap.", price: 44, comparePrice: 44, photo: "photo-1602143407151-7111542de6e8", category: "accessories", brand: "Hydro Flask", sku: "HYD-WM-32OZ", stock: 41, rating: 4.8, numReviews: 492, featured: true, variants: [{ name: "Color", options: ["Black", "Agave", "Indigo"] }] },
  { name: "Stagg EKG Electric Kettle", description: "A precision gooseneck kettle with variable temperature control, a 60-minute hold mode, and a balanced pour-over spout.", price: 165, comparePrice: 195, photo: "photo-1495474472287-4d71bcdd2085", category: "home", brand: "Fellow", sku: "FEL-STAGG-EKG", stock: 8, rating: 4.7, numReviews: 204, featured: true, specifications: { Capacity: "0.9 L", Temperature: "40-100 C", Power: "1200 W" } },
  { name: "V8 Cordless Stick Vacuum", description: "A versatile cordless vacuum with strong suction, whole-machine filtration, and tools for floors, upholstery, and tight spaces.", price: 399, comparePrice: 499, photo: "photo-1558317374-067fb5f30001", category: "home", brand: "Dyson", sku: "DYS-V8-CORD", stock: 7, rating: 4.5, numReviews: 318, featured: false },
  { name: "Ultrasonic Aroma Diffuser", description: "A quiet ultrasonic diffuser with a soft ambient light, timer settings, and automatic shutoff when the water runs low.", price: 69, comparePrice: 79, photo: "photo-1608571423902-eed4a5ad8108", category: "home", brand: "MUJI", sku: "MUJ-AROMA-ULTRA", stock: 24, rating: 4.3, numReviews: 84, featured: false },
  { name: "Signature Enameled Cast Iron Skillet", description: "A versatile enameled cast-iron skillet with even heat retention and a durable interior for searing, sautéing, and baking.", price: 220, comparePrice: 240, photo: "photo-1556911220-e15b29be8c8f", category: "home", brand: "Le Creuset", sku: "LCR-SIG-SKLT", stock: 6, rating: 4.8, numReviews: 193, featured: true },
  { name: "PRO Yoga Mat 6mm", description: "A dense, durable yoga mat with a stable grip and cushioned surface designed for regular studio practice.", price: 120, comparePrice: 138, photo: "photo-1544367567-0f2fcb009e0b", category: "sports", brand: "Manduka", sku: "MAN-PRO-MAT6", stock: 18, rating: 4.7, numReviews: 221, featured: true },
  { name: "Clash 100 V2 Tennis Racket", description: "A control-oriented 100-square-inch racket with a flexible frame engineered for comfortable, confident strokes.", price: 259, comparePrice: 279, photo: "photo-1622279457486-62dcc4a431d6", category: "sports", brand: "Wilson", sku: "WIL-CLASH100-V2", stock: 10, rating: 4.5, numReviews: 97, featured: false, specifications: { HeadSize: "100 sq in", Weight: "295 g unstrung", StringPattern: "16 x 19" } },
  { name: "Hopper Flip 12 Soft Cooler", description: "A compact leak-resistant soft cooler with closed-cell insulation, a wide opening, and rugged waterproof construction.", price: 250, comparePrice: 250, photo: "photo-1530789253388-582c481c54b0", category: "sports", brand: "YETI", sku: "YET-HOP-FLIP12", stock: 12, rating: 4.8, numReviews: 156, featured: false },
  { name: "Theragun Mini 2nd Generation", description: "A portable percussive massage device with three speed settings and an ergonomic shape for recovery at home or on the go.", price: 199, comparePrice: 219, photo: "photo-1518611012118-696072aa579a", category: "sports", brand: "Therabody", sku: "THR-MINI-G2", stock: 17, rating: 4.4, numReviews: 132, featured: true },
  { name: "Niacinamide 10% + Zinc 1% Serum", description: "A lightweight water-based serum formulated to improve the appearance of uneven tone and visible congestion.", price: 6, comparePrice: 8, photo: "photo-1608248543803-ba4f8c70ae0b", category: "beauty", brand: "The Ordinary", sku: "ORD-NIA10-ZN1", stock: 54, rating: 4.4, numReviews: 801, featured: true },
  { name: "Skin Perfecting 2% BHA Liquid", description: "A leave-on exfoliant with salicylic acid that helps clear pores and refine the look of uneven skin texture.", price: 35, comparePrice: 39, photo: "photo-1601049541289-9b1b7bbbfe19", category: "beauty", brand: "Paula's Choice", sku: "PC-BHA-2-LIQ", stock: 29, rating: 4.6, numReviews: 529, featured: false },
  { name: "Airwrap Multi-Styler Complete Long", description: "A multi-styler with Coanda airflow attachments for curling, shaping, smoothing, and drying longer hair without extreme heat.", price: 599, comparePrice: 599, photo: "photo-1522338242992-e1a54906a8da", category: "beauty", brand: "Dyson", sku: "DYS-AIRWRAP-CMP-L", stock: 5, rating: 4.5, numReviews: 176, featured: true },
  { name: "Ultra Facial Cream 50ml", description: "A lightweight daily moisturizer that helps support the skin barrier and maintain lasting hydration in changing conditions.", price: 38, comparePrice: 42, photo: "photo-1600185365483-26d7a4cc7519", category: "beauty", brand: "Kiehl's", sku: "KHL-UFC-50ML", stock: 32, rating: 4.5, numReviews: 267, featured: false },
];

function imageUrl(photo: string): string {
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&q=85`;
}

async function seed(): Promise<void> {
  await connectToDatabase();

  const categoryOperations = Object.entries(categories).map(([slug, category], index) => ({
    updateOne: {
      filter: { slug },
      update: {
        $setOnInsert: {
          _id: new Types.ObjectId(category.id),
          name: category.name,
          slug,
          description: `A considered selection of ${category.name.toLowerCase()} for everyday use.`,
          sortOrder: index,
          active: true,
        },
      },
      upsert: true,
    },
  }));
  await Category.bulkWrite(categoryOperations);

  const operations = seedProducts.map((product) => {
    const category = categories[product.category];
    const { photo, additionalPhotos = [], ...fields } = product;
    const record = {
      ...fields,
      slug: slugifyProductName(product.name),
      shortDescription: product.description.slice(0, 180),
      images: [photo, ...additionalPhotos].map(imageUrl),
      category: new Types.ObjectId(category.id),
      categorySlug: product.category,
      categoryName: category.name,
      discount: Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100),
    };

    return {
      updateOne: {
        filter: { sku: product.sku },
        update: { $set: record },
        upsert: true,
      },
    };
  });

  const result = await Product.bulkWrite(operations);
  console.info(
    `Seed complete: ${seedProducts.length} products (${result.upsertedCount} inserted, ${result.modifiedCount} updated).`,
  );
  await mongoose.disconnect();
}

seed().catch(async (error: unknown) => {
  console.error("Product seed failed. Check MONGODB_URI and database availability.");
  if (error instanceof Error) console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});