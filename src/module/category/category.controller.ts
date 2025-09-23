import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { StatusCodes } from "http-status-codes";
import { IImageFiles } from "../../interface/IImageFile";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as IImageFiles | undefined;
  const result = await CategoryService.createCategory(req.body, files);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});

const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryBySlug(
    req.params.slug as string
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as IImageFiles | undefined;
  const result = await CategoryService.updateCategory(
    req.params.id as string,
    req.body,
    files
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateStatus(req.params.id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Category is now ${result.status}`,
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  updateStatus,
};