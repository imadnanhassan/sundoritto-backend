import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { StatusCodes } from "http-status-codes";

const list = catchAsync(async (_req: Request, res: Response) => {
  const result = await NotificationService.list();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notifications fetched",
    data: result,
  });
});

const markRead = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.markRead(req.params.id as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

export const NotificationController = { list, markRead };