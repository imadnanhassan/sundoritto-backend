import { Router, type Router as ExpressRouter } from "express";
import clientInfoParser from "../../middleware/clientInfoParser";
import { AuthController } from "./auth.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/user.enum";

const router = Router();

router.post("/login", clientInfoParser, AuthController.loginUser);
router.post("/verify-2fa", AuthController.verify2FA);

router.post("/email-verification/request", auth(UserRole.CUSTOMER, UserRole.ADMIN), AuthController.requestEmailVerification);
router.get("/verify-email", AuthController.verifyEmail);

router.post("/2fa/enable", auth(UserRole.CUSTOMER, UserRole.ADMIN), AuthController.enable2FA);
router.post("/2fa/disable", auth(UserRole.CUSTOMER, UserRole.ADMIN), AuthController.disable2FA);

export const AuthRoutes: ExpressRouter = router;
