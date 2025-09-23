import { Router, type Router as ExpressRouter } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/user.enum";
import { NotificationController } from "./notification.controller";

const router = Router();

router.get("/", auth(UserRole.ADMIN), NotificationController.list);
router.patch("/:id/read", auth(UserRole.ADMIN), NotificationController.markRead);

export const NotificationRoutes: ExpressRouter = router;