import "dotenv/config";
import connectDB from "../config/database";
import { Category } from "../module/category/category.model";
import { CategoryStatus } from "../enum/category.enum";

const banner = "https://via.placeholder.com/1200x400.png?text=Banner";
const icon = "https://via.placeholder.com/128.png?text=Icon";

const categories = [
  { name: "Skin Care", slug: "skin-care", status: CategoryStatus.ACTIVE, banner, icon },
  { name: "Hair Care", slug: "hair-care", status: CategoryStatus.ACTIVE, banner, icon },
  { name: "Makeup", slug: "makeup", status: CategoryStatus.ACTIVE, banner, icon },
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