import AppError from "../../error/appError";
import { StatusCodes } from "http-status-codes";
import Brand from "./brand.model";
import { IBrand } from "./brand.interface";
import { IImageFiles } from "../../interface/IImageFile";

const createBrand = async (payload: Partial<IBrand>, files?: IImageFiles) => {
  if (files) {
    const logoFile = files["logo"]?.[0];
    if (logoFile && logoFile.path) {
      payload.logo = logoFile.path;
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
    throw new AppError(StatusCodes.BAD_REQUEST, "Brand name is required");
  }

  if (payload.slug) {
    const exists = await Brand.findOne({ slug: payload.slug });
    if (exists) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "Brand with this slug already exists"
      );
    }
  }

  const brand = new Brand({
    name: payload.name,
    logo: payload.logo ?? null,
    slug: payload.slug!,
  });

  const created = await brand.save();
  return created;
};

const getAllBrands = async () => {
  return await Brand.find().sort({ createdAt: -1 });
};

const getBrandBySlug = async (slug: string) => {
  const brand = await Brand.findOne({ slug });
  if (!brand) {
    throw new AppError(StatusCodes.NOT_FOUND, "Brand not found");
  }
  return brand;
};

const updateBrand = async (
  id: string,
  payload: Partial<IBrand>,
  files?: IImageFiles
) => {
  if (files) {
    const logoFile = files["logo"]?.[0];
    if (logoFile && logoFile.path) {
      payload.logo = logoFile.path;
    }
  }

  if (payload.name && !payload.slug) {
    payload.slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  const updated = await Brand.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) {
    throw new AppError(StatusCodes.NOT_FOUND, "Brand not found");
  }
  return updated;
};

export const BrandService = {
  createBrand,
  getAllBrands,
  getBrandBySlug,
  updateBrand,
};