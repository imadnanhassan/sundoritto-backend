import { Router, type Router as ExpressRouter } from "express";
import { UserRole } from "../../enum/user.enum";
import { UserController } from "./user.controller";
import auth from "../../middleware/auth";
import { UserValidation } from "./user.validation";
import clientInfoParser from "../../middleware/clientInfoParser";
import validateRequest from "../../middleware/validateRequest";

const router = Router();

// router.get("/", auth(UserRole.ADMIN), UserController.getAllUser);

router.post(
  "/",
  clientInfoParser,
  validateRequest(UserValidation.userValidationSchema),
  UserController.registerUser
);

export const UserRoutes: ExpressRouter = router;
