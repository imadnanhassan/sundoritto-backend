import AppError from "../../error/appError";
import { StatusCodes } from "http-status-codes";
import Product from "./product.model";
import { IProduct } from "./product.interface";
import { IImageFiles } from "../../interface/IImageFile";
import { findWithQuery } from "../../db/query";
import { IJwtPayload } from "../auth/auth.interface";
import { Types } from "mongoose";

const pathsFromFiles = (files?: IImageFiles) => {
  const result: { thumbnail?: string; gallery?: string[] } = {};

  if (!files) return result;

  const thumb = files["thumbnail"]?.[0];
  if (thumb?.path) {
    result.thumbnail = thumb.path;
  }

  const galleryFiles = files["gallery"];
  if (galleryFiles?.length) {
    result.gallery = galleryFiles.map((f) => f.path);
  }

  return result;
};

const createProduct = async (payload: Partial<IProduct>, files?: IImageFiles) => {
  const images = pathsFromFiles(files);
  payload.thumbnail = images.thumbnail ?? payload.thumbnail ?? null;
  if (images.gallery) {
    payload.gallery = images.gallery;
  }

  if (!payload.slug && payload.name) {
    payload.slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  if (!payload.name) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Product name is required");
  }
  if (!payload.category) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Category is required");
  }
  if (!payload.brand) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Brand is required");
  }
  if (payload.slug) {
    const exists = await Product.findOne({ slug: payload.slug });
    if (exists) {
      throw new AppError(StatusCodes.CONFLICT, "Product with this slug already exists");
    }
  }

  const created = await Product.create(payload);
  return created;
};

const getProducts = async (query: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string;
  brand?: string;
}) => {
  const {
    page,
    limit,
    searchTerm,
    sortBy,
    sortOrder,
    category,
    brand,
  } = query;

  const filters: Record<string, unknown> = {};
  if (category) filters.category = new Types.ObjectId(category);
  if (brand) filters.brand = new Types.ObjectId(brand);

  const result = await findWithQuery<IProduct>(
    Product,
    {},
    {
      page,
      limit,
      searchTerm,
      searchFields: ["name", "slug"],
      filters,
      sortBy,
      sortOrder,
      lean: true,
    }
  );

  return result;
};

const getProductBySlug = async (slug: string) => {
  const product = await Product.findOne({ slug })
    .populate("category")
    .populate("brand");
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
  }
  return product;
};

const updateProduct = async (
  id: string,
  payload: Partial<IProduct>,
  files?: IImageFiles
) => {
  const images = pathsFromFiles(files);
  if (images.thumbnail) payload.thumbnail = images.thumbnail;
  if (images.gallery) payload.gallery = images.gallery;

  if (payload.name && !payload.slug) {
    payload.slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  const updated = await Product.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) {
    throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
  }
  return updated;
};

const rateProduct = async (
  id: string,
  payload: { rating: number; review?: string },
  authUser: IJwtPayload
) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
  }

  // Upsert user's rating (one rating per user)
  const userId = new Types.ObjectId(authUser.userId);
  const existing = product.ratings.find((r) => r.user.toString() === userId.toString());

  if (existing) {
    existing.rating = payload.rating;
    existing.review = payload.review;
  } else {
    product.ratings.push({
      user: userId,
      rating: payload.rating,
      review: payload.review,
    } as any);
  }

  // Recompute average rating
  const sum = product.ratings.reduce((acc, r) => acc + r.rating, 0);
  product.rating = product.ratings.length ? sum / product.ratings.length : 0;

  await product.save();
  return product;
};

export const ProductService = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  rateProduct,
};