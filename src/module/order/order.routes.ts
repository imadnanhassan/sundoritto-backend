import { Router, type Router as ExpressRouter } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/user.enum";
import validateRequest from "../../middleware/validateRequest";
import { checkoutSchema, updateOrderStatusSchema } from "./order.validation";
import { OrderController } from "./order.controller";

const router = Router();

// Customer checkout (auth optional; change to required if needed)
router.post("/checkout", validateRequest(checkoutSchema), OrderController.checkout);

// Invoice PDF
router.get("/:id/invoice", OrderController.invoice);

// Customer orders
router.get("/my", auth(UserRole.CUSTOMER), OrderController.myOrders);

// Admin orders
router.get("/", auth(UserRole.ADMIN), OrderController.listOrders);
router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  validateRequest(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);
router.post("/:id/cancel", auth(UserRole.ADMIN), OrderController.cancelOrder);
router.post("/:id/refund", auth(UserRole.ADMIN), OrderController.refundOrder);

export const OrderRoutes: ExpressRouter = router;