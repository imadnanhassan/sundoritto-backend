import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import Inventory from "./inventory.model";
import { Types } from "mongoose";

const list = catchAsync(async (req: Request, res: Response) => {
  const { productId, type, from, to } = req.query as {
    productId?: string;
    type?: string;
    from?: string;
    to?: string;
  };

  const filter: any = {};
  if (productId) filter.product = new Types.ObjectId(productId);
  if (type) filter.type = type;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const result = await Inventory.find(filter)
    .populate("product", "name sku slug")
    .populate("order", "_id")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Inventory movements fetched",
    data: result,
  });
});

export const InventoryController = { list };