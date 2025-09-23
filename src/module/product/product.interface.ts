import { Document, Model, Types } from "mongoose";
import { DiscountType, ShippingType } from "../../enum/product.enum";
import { OfferType } from "../../enum/offer.enum";

export interface ISpecItem {
  key: string;
  value: string;
}

export interface IVariant {
  name: string;
  options: string[];
}

export interface ILocationShipping {
  location: string;
  price: number;
}

export interface IQnaItem {
  question: string;
  answer?: string | null;
  askedBy?: Types.ObjectId;
  answeredBy?: Types.ObjectId | null;
}

export interface IRatingItem {
  user: Types.ObjectId;
  rating: number; // 1-5
  review?: string;
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  category: Types.ObjectId;
  brand: Types.ObjectId;
  price: number;
  discount?: {
    type: DiscountType;
    value: number;
  } | null;
  rating: number; // average rating 0-5
  ratings: IRatingItem[];
  stock: number;
  longDescription?: string;
  specification?: ISpecItem[];
  shipping: {
    type: ShippingType;
    locations?: ILocationShipping[];
  };
  thumbnail?: string | null;
  gallery?: string[];
  variants?: IVariant[];
  qna?: IQnaItem[];
  howToUse?: string;

  // Promotions
  isFlashDeal?: boolean;
  flashDeal?: {
    startAt: Date;
    endAt: Date;
    dealPrice?: number; // optional specific price
  } | null;
  offerType?: OfferType | null;

  // POS
  sku: string;

  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductModel extends Model<IProduct> {
  isProductExistsBySlug(slug: string): Promise<IProduct | null>;
}