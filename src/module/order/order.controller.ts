import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { StatusCodes } from "http-status-codes";
import { IJwtPayload } from "../auth/auth.interface";
import { OrderStatus } from "../../enum/order.enum";

const checkout = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.checkout(req.body, req.user as IJwtPayload | undefined);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});

const myOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.myOrders(req.user as IJwtPayload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
});

const listOrders = catchAsync(async (_req: Request, res: Response) => {
  const result = await OrderService.listOrders();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrderStatus(
    req.params.id as string,
    req.body.status as OrderStatus
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order status updated",
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.cancelOrder(req.params.id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order canceled",
    data: result,
  });
});

const refundOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.refundOrder(req.params.id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order refunded",
    data: result,
  });
});

export const OrderController = {
  checkout,
  myOrders,
  listOrders,
  updateOrderStatus,
  cancelOrder,
  refundOrder,
};