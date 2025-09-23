import mongoose, { Schema } from "mongoose";
import { ICategory, CategoryModel } from "./category.interface";
import { CategoryStatus } from "../../enum/category.enum";

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [CategoryStatus.ACTIVE, CategoryStatus.INACTIVE],
      default: CategoryStatus.ACTIVE,
    },
    banner: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

categorySchema.statics.isCategoryExistsBySlug = async function (slug: string) {
  return await Category.findOne({ slug });
};

export const Category = mongoose.model<ICategory, CategoryModel>(
  "Category",
  categorySchema
);

export default Category;