import "dotenv/config";
import connectDB from "../config/database";
import { Category } from "../module/category/category.model";
import { CategoryStatus } from "../enum/category.enum";

const categories = [
  { name: "Skin Care", slug: "skin-care", status: CategoryStatus.ACTIVE },
  { name: "Hair Care", slug: "hair-care", status: CategoryStatus.ACTIVE },
  { name: "Makeup", slug: "makeup", status: CategoryStatus.ACTIVE },
];

export async function seedCategories() {
  await connectDB();
  for (const c of categories) {
    const exists = await Category.findOne({ slug: c.slug });
    if (!exists) {
      await Category.create(c as any);
      console.log("Seeded category:", c.slug);
    } else {
      console.log("Category exists:", c.slug);
    }
  }
}