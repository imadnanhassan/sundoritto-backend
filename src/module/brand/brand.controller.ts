import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { BrandService } from "./brand.service";
import { StatusCodes } from "http-status-codes";
import { IImageFiles } from "../../interface/IImageFile";

const createBrand = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as IImageFiles | undefined;
  const result = await BrandService.createBrand(req.body, files);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Brand created successfully",
    data: result,
  });
});

const getAllBrands = catchAsync(async (_req: Request, res: Response) => {
  const result = await BrandService.getAllBrands();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Brands retrieved successfully",
    data: result,
  });
});

const getBrandBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await BrandService.getBrandBySlug(req.params.slug as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Brand retrieved successfully",
    data: result,
  });
});

const updateBrand = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as IImageFiles | undefined;
  const result = await BrandService.updateBrand(
    req.params.id as string,
    req.body,
    files
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Brand updated successfully",
    data: result,
  });
});

export const BrandController = {
  createBrand,
  getAllBrands,
  getBrandBySlug,
  updateBrand,
};