import { Router } from "express";
import { CategoryController } from "./controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class CategoryRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CategoryController();

    // Definir las rutas
    router.get("/", controller.getCategories);
    router.post("/", [AuthMiddleware.validateJWT], controller.createCategory);

    return router;
  }
}
