import { Router, type Router as ExpressRouter } from "express";
import { ProductController } from "./product.controller";
import validateRequest from "../../middleware/validateRequest";
import { createProductSchema, rateProductSchema, updateProductSchema } from "./product.validation";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middleware/bodyParser";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/user.enum";

const router = Router();

// Public routes
router.get("/", ProductController.getProducts);
router.get("/:slug", ProductController.getProductBySlug);

// Admin routes
router.post(
  "/",
  auth(UserRole.ADMIN),
  multerUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  parseBody,
  validateRequest(createProductSchema),
  ProductController.createProduct
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  multerUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  parseBody,
  validateRequest(updateProductSchema),
  ProductController.updateProduct
);

// Customer route for rating
router.post(
  "/:id/rate",
  auth(UserRole.CUSTOMER),
  validateRequest(rateProductSchema),
  ProductController.rateProduct
);

export const ProductRoutes: ExpressRouter = router;