import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { StatusCodes } from "http-status-codes";
import { IImageFiles } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as IImageFiles | undefined;
  const result = await ProductService.createProduct(req.body, files);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProducts({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    searchTerm: req.query.searchTerm as string | undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: (req.query.sortOrder as "asc" | "desc") || undefined,
    category: req.query.category as string | undefined,
    brand: req.query.brand as string | undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProductBySlug(req.params.slug as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as IImageFiles | undefined;
  const result = await ProductService.updateProduct(
    req.params.id as string,
    req.body,
    files
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const rateProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.rateProduct(
    req.params.id as string,
    req.body,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product rated successfully",
    data: result,
  });
});

const getCategoryWiseProducts = catchAsync(async (_req: Request, res: Response) => {
  const result = await ProductService.getCategoryWiseProducts();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category-wise products retrieved successfully",
    data: result,
  });
});

const getBrandProductCounts = catchAsync(async (_req: Request, res: Response) => {
  const result = await ProductService.getBrandProductCounts();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Brand product counts retrieved successfully",
    data: result,
  });
});

const adjustStock = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.adjustStock(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Stock updated successfully",
    data: result,
  });
});

const setFlashDeal = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.setFlashDeal(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Flash deal set successfully",
    data: result,
  });
});

const clearFlashDeal = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.clearFlashDeal(req.params.id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Flash deal cleared successfully",
    data: result,
  });
});

const getActiveFlashDeals = catchAsync(async (_req: Request, res: Response) => {
  const result = await ProductService.getActiveFlashDeals();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Active flash deals retrieved successfully",
    data: result,
  });
});

const setOfferType = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.setOfferType(
    req.params.id as string,
    req.body.offerType ?? null
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Offer type updated successfully",
    data: result,
  });
});

const getOfferProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getOfferProducts(req.params.type as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Offer products retrieved successfully",
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  rateProduct,
  getCategoryWiseProducts,
  getBrandProductCounts,
  adjustStock,
  setFlashDeal,
  clearFlashDeal,
  getActiveFlashDeals,
  setOfferType,
  getOfferProducts,
};