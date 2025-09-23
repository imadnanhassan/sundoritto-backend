import "dotenv/config";
import connectDB from "../config/database";
import Brand from "../module/brand/brand.model";

const logo = "https://via.placeholder.com/256.png?text=Logo";

const brands = [
  { name: "Sundoritto", slug: "sundoritto", logo },
  { name: "Glowify", slug: "glowify", logo },
  { name: "PureCare", slug: "purecare", logo },
];

export async function seedBrands() {
  await connectDB();
  for (const b of brands) {
    const exists = await Brand.findOne({ slug: b.slug });
    if (!exists) {
      await Brand.create(b as any);
      console.log("Seeded brand:", b.slug);
    } else {
      console.log("Brand exists:", b.slug);
    }
  }
}