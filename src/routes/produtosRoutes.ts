import express from "express";
import ProdutoController from "../controllers/produtoController";

const routes = express.Router();

routes.get("/produtos", ProdutoController.listarProdutos);
routes.post("/produtos", ProdutoController.cadastrarProduto);

export default routes;
