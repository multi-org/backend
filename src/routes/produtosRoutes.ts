import express from "express";
import ProdutoController from "../controllers/produtoController";

const routes = express.Router();

routes.get("/produtos", ProdutoController.listarProdutos);
routes.get("/produtos/nomeOuId", ProdutoController.listarProdutoPorNomeOuId);
routes.post("/produtos", ProdutoController.cadastrarProduto);
routes.put("/produtos/:id", ProdutoController.atualizarProduto);
routes.delete("/produtos/:id", ProdutoController.deletarProduto);
routes.delete("/produtos/nome", ProdutoController.deletarProduto);

export default routes;

// Busca por nome e ID utilizam de query, ou seja a rota de ambas devem ser busca por query.
