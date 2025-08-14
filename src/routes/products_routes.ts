import express from "express";
import ProdutoController from "../controllers/product_controller";
import { jwtRequired } from "@app/middlewares/global_middleware";
import { checkCompanyPermission } from "@app/middlewares/checkPermissions_middlewares";
import { uploadImages } from "@app/middlewares/upload_middlewares";

const routes = express.Router();

routes.post(
  "/:companyId",
  jwtRequired,
  checkCompanyPermission("create:product"),
  uploadImages.array("images"),
  ProdutoController.createProduct
);

routes.get(
  "/details/:productId",
  jwtRequired,
  ProdutoController.getProductById
);
routes.get(
  "/search/:search",
  jwtRequired,
  ProdutoController.getProductsMultipleFields
);
routes.get("/all", jwtRequired, ProdutoController.getAlProducts);

routes.get("/:ownerId", jwtRequired, ProdutoController.getProductsOwner);
export default routes;

// Busca por nome e ID utilizam de query, ou seja a rota de ambas devem ser busca por query.
