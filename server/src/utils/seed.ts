/**
 * Database seeder for development.
 *
 * Creates sample products across categories to enable frontend development
 * without manual data entry. Uses realistic product data.
 *
 * Why use the UserRole enum instead of a string literal?
 * The enum is the single source of truth for valid role values. If we ever
 * rename or add roles, TypeScript will catch every usage site. Magic strings
 * scattered through the codebase create silent breakage.
 */

import { Product, User } from "../models";
import { UserRole } from "../types";
import { connectDatabase, disconnectDatabase } from "../config/database";

const sampleProducts = [
  {
    name: "Classic White Sneakers",
    description:
      "Minimalist white leather sneakers with cushioned sole. Perfect for everyday wear with a clean, modern aesthetic.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
    category: "footwear",
    stock: 45,
  },
  {
    name: "Premium Leather Backpack",
    description:
      "Full-grain leather backpack with laptop compartment. Water-resistant lining with antique brass hardware.",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    category: "bags",
    stock: 30,
  },
  {
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Over-ear headphones with active noise cancellation. 30-hour battery life, premium memory foam ear cushions.",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    category: "electronics",
    stock: 25,
  },
  {
    name: "Organic Cotton T-Shirt",
    description:
      "Sustainably sourced 100% organic cotton tee. Pre-shrunk with reinforced stitching for durability.",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    category: "clothing",
    stock: 100,
  },
  {
    name: "Mechanical Keyboard",
    description:
      "Cherry MX Blue switches, RGB backlighting, aluminum frame. Tactile feedback for precision typing.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c529e2b?w=600",
    category: "electronics",
    stock: 40,
  },
  {
    name: "Titanium Watch",
    description:
      "Swiss-made titanium case with sapphire crystal. Automatic movement, 200m water resistance.",
    price: 499.99,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
    category: "accessories",
    stock: 15,
  },
  {
    name: "Denim Jacket",
    description:
      "Classic cut denim jacket in indigo wash. Heavyweight 14oz selvedge denim, button closure.",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600",
    category: "clothing",
    stock: 55,
  },
  {
    name: "Running Shoes Pro",
    description:
      "Lightweight mesh upper with responsive foam midsole. Engineered for long-distance comfort.",
    price: 139.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    category: "footwear",
    stock: 60,
  },
  {
    name: "Canvas Tote Bag",
    description:
      "Heavy-duty 18oz canvas tote with leather handles. Reinforced bottom panel, interior zip pocket.",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
    category: "bags",
    stock: 70,
  },
  {
    name: "Polarized Sunglasses",
    description:
      "Acetate frame with polarized UV400 lenses. Lightweight construction with spring hinges.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
    category: "accessories",
    stock: 85,
  },
  {
    name: "Wool Blend Overcoat",
    description:
      "Italian wool blend overcoat with satin lining. Double-breasted construction, knee length.",
    price: 259.99,
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e4?w=600",
    category: "clothing",
    stock: 20,
  },
  {
    name: "Bluetooth Speaker",
    description:
      "Portable waterproof speaker with 360° sound. 12-hour playtime, IP67 rated, built-in microphone.",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
    category: "electronics",
    stock: 50,
  },
  {
    name: "Slim Fit Chinos",
    description:
      "Stretch cotton chinos with a modern slim fit. Wrinkle-resistant fabric with hidden pocket detail.",
    price: 64.99,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600",
    category: "clothing",
    stock: 75,
  },
  {
    name: "Leather Wallet",
    description:
      "Bifold wallet in full-grain leather with RFID blocking. 8 card slots, bill compartment, coin pocket.",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
    category: "accessories",
    stock: 90,
  },
  {
    name: "Trail Hiking Boots",
    description:
      "Waterproof suede and mesh upper with Vibram outsole. Ankle support, cushioned insole.",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=600",
    category: "footwear",
    stock: 35,
  },
  {
    name: "Messenger Bag",
    description:
      'Waxed canvas messenger bag with adjustable leather strap. Fits 15" laptop, quick-access front pocket.',
    price: 89.99,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
    category: "bags",
    stock: 40,
  },
];

async function seed(): Promise<void> {
  try {
    await connectDatabase();

    await Product.deleteMany({});
    await User.deleteMany({});

    await Product.insertMany(sampleProducts);
    console.log(`[Seed] Inserted ${sampleProducts.length} products`);

    await User.create({
      email: "demo@aura.com",
      passwordHash: "Demo1234",
      role: UserRole.CUSTOMER,
    });
    console.log("[Seed] Created demo user: demo@aura.com / Demo1234");

    console.log("[Seed] Database seeded successfully");
  } catch (error) {
    console.error("[Seed] Error:", error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

seed();
