import { Router, type Router as ExpressRouter } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/user.enum";
import { InventoryController } from "./inventory.controller";

const router = Router();

router.get("/", auth(UserRole.ADMIN), InventoryController.list);

export const InventoryRoutes: ExpressRouter = router;