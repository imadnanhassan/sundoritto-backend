import { Router, type Router as ExpressRouter } from "express";
import { UserRoutes } from "../module/user/user.routes";
import { AuthRoutes } from "../module/auth/auth.routes";
import { CategoryRoutes } from "../module/category/category.routes";
import { BrandRoutes } from "../module/brand/brand.routes";
import { ProductRoutes } from "../module/product/product.routes";
import { OrderRoutes } from "../module/order/order.routes";

const router: ExpressRouter = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/brand",
    route: BrandRoutes,
  },
  {
    path: "/product",
    route: ProductRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
