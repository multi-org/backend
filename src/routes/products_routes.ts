import express from "express";
import ProdutoController from "../controllers/product_controller";
import { jwtRequired } from "@app/middlewares/global_middleware";
import { checkCompanyPermission } from "@app/middlewares/checkPermissions_middlewares";

const routes = express.Router();

routes.post("/:companyId", jwtRequired, checkCompanyPermission("create:product"), ProdutoController.createProduct);
routes.get("/:ownerId", jwtRequired, ProdutoController.getProducts);
routes.get("/details/:productId", jwtRequired, ProdutoController.getProductById);
routes.get("/search/:search", jwtRequired, ProdutoController.getProductsMultipleFields);

export default routes;

// Busca por nome e ID utilizam de query, ou seja a rota de ambas devem ser busca por query.
