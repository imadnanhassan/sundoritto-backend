import { Router, type Router as ExpressRouter } from "express";
import { CategoryController } from "./category.controller";
import validateRequest from "../../middleware/validateRequest";
import { createCategorySchema, updateCategorySchema } from "./category.validation";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middleware/bodyParser";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/user.enum";

const router = Router();

// Public routes
router.get("/", CategoryController.getAllCategories);
router.get("/:slug", CategoryController.getCategoryBySlug);

// Admin routes
router.post(
  "/",
  auth(UserRole.ADMIN),
  multerUpload.fields([
    { name: "banner", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  parseBody,
  validateRequest(createCategorySchema),
  CategoryController.createCategory
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  multerUpload.fields([
    { name: "banner", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  parseBody,
  validateRequest(updateCategorySchema),
  CategoryController.updateCategory
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  CategoryController.updateStatus
);

export const CategoryRoutes: ExpressRouter = router;