import { Router, type Router as ExpressRouter } from "express";
import clientInfoParser from "../../middleware/clientInfoParser";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/login", clientInfoParser, AuthController.loginUser);

export const AuthRoutes: ExpressRouter = router;
