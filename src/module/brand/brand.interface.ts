import { Document, Model } from "mongoose";

export interface IBrand extends Document {
  name: string;
  logo?: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandModel extends Model<IBrand> {
  isBrandExistsBySlug(slug: string): Promise<IBrand | null>;
}