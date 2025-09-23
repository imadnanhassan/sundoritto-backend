import { Router, type Router as ExpressRouter } from "express";
import { UserRoutes } from "../module/user/user.routes";
import { AuthRoutes } from "../module/auth/auth.routes";
import { CategoryRoutes } from "../module/category/category.routes";

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
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
