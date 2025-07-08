import express from "express";
import ProdutoController from "../controllers/product_controller";
import {jwtRequired} from "@app/middlewares/global_middleware"
import { checkCompanyPermission } from "@app/middlewares/checkPermissions_middlewares"

const routes = express.Router();

routes.post("/:companyId/:ownerId", jwtRequired, checkCompanyPermission('create:product'), ProdutoController.createProduct);
routes.get("/produtos", jwtRequired, checkCompanyPermission, ProdutoController.listarProdutos);
routes.get("/produtos/nomeOuId", jwtRequired, checkCompanyPermission, ProdutoController.listarProdutoPorNomeOuId);
routes.put("/produtos/:id", jwtRequired, checkCompanyPermission, ProdutoController.atualizarProduto);
routes.delete("/produtos/:id", jwtRequired, checkCompanyPermission, ProdutoController.deletarProduto);

export default routes;

// Busca por nome e ID utilizam de query, ou seja a rota de ambas devem ser busca por query.
