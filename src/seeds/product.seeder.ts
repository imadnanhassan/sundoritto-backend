import "dotenv/config";
import connectDB from "../config/database";
import Product from "../module/product/product.model";
import { Category } from "../module/category/category.model";
import Brand from "../module/brand/brand.model";
import { ShippingType } from "../enum/product.enum";

const products = [
  {
    name: "Hydrating Face Cream",
    slug: "hydrating-face-cream",
    sku: "SKU-CR-001",
    price: 1200,
    stock: 50,
    shipping: { type: ShippingType.FREE },
    voucherBalance: 0,
  },
  {
    name: "Nourishing Hair Oil",
    slug: "nourishing-hair-oil",
    sku: "SKU-HO-001",
    price: 800,
    stock: 100,
    shipping: { type: ShippingType.LOCATION_BASED, locations: [{ location: "Dhaka", price: 60 }] },
    voucherBalance: 0,
  },
];

export async function seedProducts() {
  await connectDB();

  const catSkin = await Category.findOne({ slug: "skin-care" });
  const catHair = await Category.findOne({ slug: "hair-care" });
  const brand = await Brand.findOne({ slug: "sundoritto" }) || await Brand.findOne({});

  if (!catSkin || !catHair || !brand) {
    console.log("Seed prerequisites missing (categories/brand). Please run category and brand seeders first.");
    return;
  }

  const mapping: Record<string, any> = {
    "hydrating-face-cream": { category: catSkin._id, brand: brand._id },
    "nourishing-hair-oil": { category: catHair._id, brand: brand._id },
  };

  for (const p of products) {
    const exists = await Product.findOne({ slug: p.slug });
    if (!exists) {
      await Product.create({
        ...p,
        category: mapping[p.slug].category,
        brand: mapping[p.slug].brand,
      } as any);
      console.log("Seeded product:", p.slug);
    } else {
      console.log("Product exists:", p.slug);
    }
  }
}