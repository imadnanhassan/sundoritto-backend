import AppError from "../../error/appError";
import { StatusCodes } from "http-status-codes";
import { ICategory } from "./category.interface";
import Category from "./category.model";
import { CategoryStatus } from "../../enum/category.enum";
import { IImageFile, IImageFiles } from "../../interface/IImageFile";

const createCategory = async (
  payload: Partial<ICategory>,
  files?: IImageFiles
) => {
  if (files) {
    const bannerFile = files["banner"]?.[0];
    const iconFile = files["icon"]?.[0];

    if (bannerFile && bannerFile.path) {
      payload.banner = bannerFile.path;
    }
    if (iconFile && iconFile.path) {
      payload.icon = iconFile.path;
    }
  }

  // Auto-generate slug if not provided
  if (!payload.slug && payload.name) {
    payload.slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  if (!payload.name) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Category name is required");
  }

  if (payload.slug) {
    const exists = await Category.findOne({ slug: payload.slug });
    if (exists) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "Category with this slug already exists"
      );
    }
  }

  const category = new Category({
    name: payload.name,
    status: payload.status ?? CategoryStatus.ACTIVE,
    banner: payload.banner ?? null,
    icon: payload.icon ?? null,
    slug: payload.slug!,
  });

  const created = await category.save();
  return created;
};

const getAllCategories = async () => {
  return await Category.find().sort({ createdAt: -1 });
};

const getCategoryBySlug = async (slug: string) => {
  const category = await Category.findOne({ slug });
  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
  }
  return category;
};

const updateCategory = async (
  id: string,
  payload: Partial<ICategory>,
  files?: IImageFiles
) => {
  if (files) {
    const bannerFile = files["banner"]?.[0];
    const iconFile = files["icon"]?.[0];

    if (bannerFile && bannerFile.path) {
      payload.banner = bannerFile.path;
    }
    if (iconFile && iconFile.path) {
      payload.icon = iconFile.path;
    }
  }

  if (payload.name && !payload.slug) {
    payload.slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  const updated = await Category.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
  }
  return updated;
};

const updateStatus = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
  }
  category.status =
    category.status === CategoryStatus.ACTIVE
      ? CategoryStatus.INACTIVE
      : CategoryStatus.ACTIVE;
  return await category.save();
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  updateStatus,
};