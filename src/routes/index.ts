import { Router, type Router as ExpressRouter } from "express";
import { UserRoutes } from "../module/user/user.routes";

const router: ExpressRouter = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
