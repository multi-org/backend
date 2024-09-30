import express from "express";
import ProdutoController from "../controllers/produtoController";

const routes = express.Router();

routes.get("/produtos", ProdutoController.listarProdutos);
routes.get("/produtos/nome", ProdutoController.listarProdutoPorNome);
routes.post("/produtos", ProdutoController.cadastrarProduto);
routes.put("/produtos/:id", ProdutoController.atualizarProduto);
routes.delete("/produtos/:id", ProdutoController.deletarProduto);
routes.delete("/produtos/nome", ProdutoController.deletarProduto);

export default routes;
