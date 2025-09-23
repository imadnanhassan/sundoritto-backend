import mongoose, { Schema, Types } from "mongoose";
import { IProduct, ProductModel } from "./product.interface";
import { DiscountType, ShippingType } from "../../enum/product.enum";
import { OfferType } from "../../enum/offer.enum";

const specItemSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const variantSchema = new Schema(
  {
    name: { type: String, required: true },
    options: [{ type: String, required: true }],
  },
  { _id: false }
);

const locationShippingSchema = new Schema(
  {
    location: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const qnaSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: null },
    askedBy: { type: Schema.Types.ObjectId, ref: "User" },
    answeredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const ratingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
  },
  { _id: false, timestamps: true }
);

const productSchema = new Schema<IProduct, ProductModel>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    price: { type: Number, required: true, min: 0 },
    discount: {
      type: {
        type: String,
        enum: [DiscountType.PERCENT, DiscountType.FLAT],
      },
      value: { type: Number, min: 0 },
    },
    rating: { type: Number, default: 0 },
    ratings: [ratingSchema],
    stock: { type: Number, default: 0, min: 0 },
    longDescription: { type: String },
    specification: [specItemSchema],
    shipping: {
      type: {
        type: String,
        enum: [ShippingType.FREE, ShippingType.LOCATION_BASED],
        default: ShippingType.FREE,
      },
      locations: [locationShippingSchema],
    },
    thumbnail: { type: String, default: null },
    gallery: [{ type: String }],
    variants: [variantSchema],
    qna: [qnaSchema],
    howToUse: { type: String },

    // POS
    sku: { type: String, required: true, unique: true, trim: true },

    // Voucher balance (does not reduce product price; for free delivery products rule)
    voucherBalance: { type: Number, default: 0, min: 0 },

    // Promotions
    isFlashDeal: { type: Boolean, default: false },
    flashDeal: {
      startAt: { type: Date },
      endAt: { type: Date },
      dealPrice: { type: Number, min: 0 },
    },
    offerType: {
      type: String,
      enum: [
        OfferType.WINTER,
        OfferType.SUMMER,
        OfferType.EID,
        OfferType.WOMEN_SPECIAL,
      ],
      default: null,
    },

    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

productSchema.statics.isProductExistsBySlug = async function (slug: string) {
  return await Product.findOne({ slug });
};

export const Product = mongoose.model<IProduct, ProductModel>("Product", productSchema);
export default Product;