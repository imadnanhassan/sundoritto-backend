import { Router, type Router as ExpressRouter } from "express";
import { UserRole } from "../../enum/user.enum";
import { UserController } from "./user.controller";
import auth from "../../middleware/auth";
import { UserValidation } from "./user.validation";
import clientInfoParser from "../../middleware/clientInfoParser";
import validateRequest from "../../middleware/validateRequest";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middleware/bodyParser";

const router = Router();

// router.get("/", auth(UserRole.ADMIN), UserController.getAllUser);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.CUSTOMER),
  UserController.myProfile
);

router.post(
  "/",
  clientInfoParser,
  validateRequest(UserValidation.userValidationSchema),
  UserController.registerUser
);

// update profile
router.patch(
  "/update-profile",
  auth(UserRole.CUSTOMER),
  multerUpload.single("profilePhoto"),
  parseBody,
  validateRequest(UserValidation.customerInfoValidationSchema),
  UserController.updateProfile
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  UserController.updateUserStatus
);

export const UserRoutes: ExpressRouter = router;
