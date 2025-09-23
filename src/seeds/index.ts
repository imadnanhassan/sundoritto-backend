import "dotenv/config";
import connectDB from "../config/database";
import { seedCategories } from "./category.seeder";
import { seedBrands } from "./brand.seeder";
import { seedProducts } from "./product.seeder";
import "../seeds/admin.seeder"; // optional import, we'll run admin separately

async function runAll() {
  await connectDB();
  console.log("Seeding categories...");
  await seedCategories();
  console.log("Seeding brands...");
  await seedBrands();
  console.log("Seeding products...");
  await seedProducts();
  console.log("All seeds completed.");
  process.exit(0);
}

runAll().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});