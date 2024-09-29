import produto from "../models/Produto";
import { Request, Response } from "express";

class ProdutoController {
  static async listarProdutos(req: Request, res: Response) {
    try {
      const produtos = await produto.find({});
      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  static async cadastrarProduto(req: Request, res: Response) {
    try {
      const novoProduto = await produto.create(req.body);
      return res.status(201).json(novoProduto);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }
}

export default ProdutoController;
