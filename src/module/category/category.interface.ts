import { Document, Model } from "mongoose";
import { CategoryStatus } from "../../enum/category.enum";

export interface ICategory extends Document {
  name: string;
  status: CategoryStatus;
  banner?: string | null;
  icon?: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryModel extends Model<ICategory> {
  isCategoryExistsBySlug(slug: string): Promise<ICategory | null>;
}