import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";
import { StatusCodes } from "http-status-codes";

const summary = catchAsync(async (req: Request, res: Response) => {
  const range = (req.query.range as "weekly" | "monthly" | "yearly") || "weekly";
  const result = await AnalyticsService.summary(range);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Analytics summary fetched",
    data: result,
  });
});

export const AnalyticsController = { summary };