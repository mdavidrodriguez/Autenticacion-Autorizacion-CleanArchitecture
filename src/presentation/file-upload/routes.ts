import { Router } from "express";
import { FileUploadController } from "./controller";
import { FileUploadService } from "../services/file-upload.service";
import { FileUploadMiddleware } from "../middleware/file-upload-middleware";
import { TypeMiddleware } from "../middleware/type.middleware";

export class FileUploadRoutes {
  static get routes(): Router {
    const router = Router();

    const controller = new FileUploadController(new FileUploadService());

    router.use(FileUploadMiddleware.containtFiles);
    // Definir las rutas
    router.use(TypeMiddleware.validTypes(["users", "products", "categories"]));
    // Definir las rutas
    router.post("/single/:type", controller.uploadFile);
    router.post("/multiple/:type", controller.uplaodMultipleFiles);

    return router;
  }
}
