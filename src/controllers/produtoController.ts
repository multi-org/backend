import produto from "../models/Produto";
import { Request, Response } from "express";

class ProdutoController {
  static async listarProdutos(req: Request, res: Response) {
    try {
      const { nome } = req.query;

      if (nome && typeof nome === "string" && nome.trim() === "") {
        return res.status(400).json({ error: '"nome" não pode ser vazio!' });
      }

      const produtos = nome
        ? await produto.find({
            nome: { $regex: new RegExp(nome as string, "i") },
          })
        : await produto.find({});

      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  static async listarProdutoPorNome(req: Request, res: Response) {
    try {
      const nome = req.query.nome;
      if (typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ error: "Nome inválido!" });
      }

      const produtos = await produto.find({
        nome: { $regex: nome, $options: "i" },
      });
      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  static async cadastrarProduto(req: Request, res: Response) {
    try {
      const { nome, categoria, disponibilidade, preco } = req.body;

      if (!nome || !categoria || !disponibilidade || preco === undefined) {
        return res
          .status(400)
          .json({ error: "Todos os campos são obrigatórios!" });
      }

      if (!Array.isArray(disponibilidade) || disponibilidade.length === 0) {
        return res
          .status(400)
          .json({ error: "Disponibilidade deve ser um array!" });
      }

      const novoProduto = await produto.create(req.body);
      return res.status(201).json(novoProduto);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  static async atualizarProduto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, descricao, categoria, disponibilidade, preco } = req.body;

      const camposAtualizados = [
        nome,
        descricao,
        categoria,
        disponibilidade,
        preco,
      ].filter((campo) => campo !== undefined && campo !== "");

      if (camposAtualizados.length === 0) {
        return res
          .status(400)
          .json({ error: "Pelo menos um campo deve ser atualizado!" });
      }

      const produtoAtualizado = await produto.findByIdAndUpdate(
        id,
        { nome, descricao, categoria, disponibilidade, preco },
        { new: true, runValidators: true },
      );

      if (!produtoAtualizado) {
        return res.status(404).json({ error: "Produto não encontrado!" });
      }

      return res.status(200).json(produtoAtualizado);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  static async deletarProduto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome } = req.query;

      if (!id && !nome) {
        return res
          .status(400)
          .json({ error: "É necessário fornecer o ID ou nome do produto" });
      }

      let produtoDeletado;

      if (id) {
        produtoDeletado = await produto.findByIdAndDelete(id);
      }

      if (nome) {
        const produtoExistente = await produto.findOne({
          nome: { $regex: new RegExp(nome as string, "i") },
        });
        if (!produtoExistente) {
          return res.status(404).json({ error: "Produto não encontrado!" });
        }
        produtoDeletado = await produto.findOneAndDelete({
          nome: { $regex: new RegExp(nome as string, "i") },
        });
      }

      if (!produtoDeletado) {
        return res.status(404).json({ error: "Produto não encontrado!" });
      }

      return res.status(200).json({ message: "Produto excluído com sucesso!" });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  }
}

export default ProdutoController;
