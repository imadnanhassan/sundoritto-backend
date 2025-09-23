import { Router, type Router as ExpressRouter } from "express";
import { AnalyticsController } from "./analytics.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/user.enum";
import { generateSystemReportPDF } from "../../utils/pdf";

const router = Router();

// Admin-only
router.get("/summary", auth(UserRole.ADMIN), AnalyticsController.summary);

router.get("/report.pdf", auth(UserRole.ADMIN), async (req, res, next) => {
  try {
    const range = (req.query.range as "weekly" | "monthly" | "yearly") || "weekly";
    const result = await (await import("./analytics.service")).AnalyticsService.summary(range);
    generateSystemReportPDF(result as any, res);
  } catch (e) {
    next(e);
  }
});

export const AnalyticsRoutes: ExpressRouter = router;