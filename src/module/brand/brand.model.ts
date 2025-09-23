import mongoose, { Schema } from "mongoose";
import { IBrand, BrandModel } from "./brand.interface";

const brandSchema = new Schema<IBrand, BrandModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
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

brandSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

brandSchema.statics.isBrandExistsBySlug = async function (slug: string) {
  return await Brand.findOne({ slug });
};

export const Brand = mongoose.model<IBrand, BrandModel>("Brand", brandSchema);

export default Brand;