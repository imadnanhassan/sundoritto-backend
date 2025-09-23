import "dotenv/config";
import connectDB from "../config/database";
import Product from "../module/product/product.model";
import { Category } from "../module/category/category.model";
import Brand from "../module/brand/brand.model";
import { ShippingType } from "../enum/product.enum";

const thumb = "https://via.placeholder.com/400.png?text=Product";
const galleryImg = "https://via.placeholder.com/600.png?text=Gallery";

const products = [
  {
    name: "Hydrating Face Cream",
    slug: "hydrating-face-cream",
    sku: "SKU-CR-001",
    price: 1200,
    stock: 50,
    shipping: { type: ShippingType.FREE },
    voucherBalance: 0,
    thumbnail: thumb,
    gallery: [galleryImg, galleryImg],
    specification: [
      { key: "Size", value: "50ml" },
      { key: "Skin Type", value: "Dry/Normal" }
    ],
    variants: [
      { name: "Size", options: ["30ml", "50ml"] }
    ]
  },
  {
    name: "Nourishing Hair Oil",
    slug: "nourishing-hair-oil",
    sku: "SKU-HO-001",
    price: 800,
    stock: 100,
    shipping: { type: ShippingType.LOCATION_BASED, locations: [{ location: "Dhaka", price: 60 }] },
    voucherBalance: 0,
    thumbnail: thumb,
    gallery: [galleryImg],
    specification: [
      { key: "Volume", value: "100ml" }
    ],
    variants: [
      { name: "Fragrance", options: ["Rose", "Jasmine"] }
    ]
  },
  {
    name: "Matte Lipstick",
    slug: "matte-lipstick",
    sku: "SKU-LS-001",
    price: 500,
    stock: 200,
    shipping: { type: ShippingType.FREE },
    voucherBalance: 0,
    thumbnail: thumb,
    gallery: [galleryImg, galleryImg],
    specification: [
      { key: "Finish", value: "Matte" }
    ],
    variants: [
      { name: "Shade", options: ["Red", "Nude", "Pink"] }
    ]
  }
];

export async function seedProducts() {
  await connectDB();

  const catSkin = await Category.findOne({ slug: "skin-care" });
  const catHair = await Category.findOne({ slug: "hair-care" });
  const catMakeup = await Category.findOne({ slug: "makeup" });
  const brand = await Brand.findOne({ slug: "sundoritto" }) || await Brand.findOne({});

  if (!catSkin || !catHair || !catMakeup || !brand) {
    console.log("Seed prerequisites missing (categories/brand). Please run category and brand seeders first.");
    return;
  }

  const mapping: Record<string, any> = {
    "hydrating-face-cream": { category: catSkin._id, brand: brand._id },
    "nourishing-hair-oil": { category: catHair._id, brand: brand._id },
    "matte-lipstick": { category: catMakeup._id, brand: brand._id },
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