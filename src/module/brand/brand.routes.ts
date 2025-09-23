import { Router, type Router as ExpressRouter } from "express";
import { BrandController } from "./brand.controller";
import validateRequest from "../../middleware/validateRequest";
import { createBrandSchema, updateBrandSchema } from "./brand.validation";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middleware/bodyParser";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/user.enum";

const router = Router();

// Public routes
router.get("/", BrandController.getAllBrands);
router.get("/:slug", BrandController.getBrandBySlug);

// Admin routes
router.post(
  "/",
  auth(UserRole.ADMIN),
  multerUpload.fields([{ name: "logo", maxCount: 1 }]),
  parseBody,
  validateRequest(createBrandSchema),
  BrandController.createBrand
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  multerUpload.fields([{ name: "logo", maxCount: 1 }]),
  parseBody,
  validateRequest(updateBrandSchema),
  BrandController.updateBrand
);

export const BrandRoutes: ExpressRouter = router;