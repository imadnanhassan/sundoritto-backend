import { Router, type Router as ExpressRouter } from "express";
import { ProductController } from "./product.controller";
import validateRequest from "../../middleware/validateRequest";
import { adjustStockSchema, createProductSchema, rateProductSchema, setFlashDealSchema, setOfferTypeSchema, updateProductSchema } from "./product.validation";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middleware/bodyParser";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/user.enum";

const router = Router();

// Public routes
router.get("/", ProductController.getProducts);
router.get("/:slug", ProductController.getProductBySlug);
router.get("/flash-deals/active", ProductController.getActiveFlashDeals);
router.get("/offers/:type", ProductController.getOfferProducts);

// Analytics routes (public)
router.get("/stats/category-wise/list", ProductController.getCategoryWiseProducts);
router.get("/stats/brand-counts", ProductController.getBrandProductCounts);

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

// Admin stock management
router.patch(
  "/:id/stock",
  auth(UserRole.ADMIN),
  validateRequest(adjustStockSchema),
  ProductController.adjustStock
);

// Admin flash deal management
router.patch(
  "/:id/flash-deal",
  auth(UserRole.ADMIN),
  validateRequest(setFlashDealSchema),
  ProductController.setFlashDeal
);
router.delete(
  "/:id/flash-deal",
  auth(UserRole.ADMIN),
  ProductController.clearFlashDeal
);

// Admin offer type management
router.patch(
  "/:id/offer-type",
  auth(UserRole.ADMIN),
  validateRequest(setOfferTypeSchema),
  ProductController.setOfferType
);

// Customer route for rating
router.post(
  "/:id/rate",
  auth(UserRole.CUSTOMER),
  validateRequest(rateProductSchema),
  ProductController.rateProduct
);

export const ProductRoutes: ExpressRouter = router;