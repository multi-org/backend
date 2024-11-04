import request from "supertest";
import express, { Application } from "express";
import ProdutoController from "../controllers/produtoController";
import produto from "../models/Produto";

const app: Application = express();
app.use(express.json());

app.get("/produtos", ProdutoController.listarProdutos);
app.get("/produtos/nomeOuId", ProdutoController.listarProdutoPorNomeOuId);
app.post("/produtos", ProdutoController.cadastrarProduto);
app.put("/produtos/:id", ProdutoController.atualizarProduto);
app.delete("/produtos/:id", ProdutoController.deletarProduto);

jest.mock("../models/Produto");

describe("ProdutoController", () => {
  const produtosMock = [
    { nome: "Produto 1", preco: 100, _id: "66ff0f00e961f5caede885b4" },
    { nome: "Produto 2", preco: 200, _id: "6707d6d290c982eb974c81e5" },
  ];

  const produtoMock = {
    nome: "Produto 1",
    preco: 100,
    _id: "66ff0f00e961f5caede885b4",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /produtos", () => {
    it("Lista todos os produtos", async () => {
      (produto.find as jest.Mock).mockResolvedValue(produtosMock);
      const res = await request(app).get("/produtos");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(produtosMock);
    });

    it("Retorna o erro 400 caso nome seja vazio", async () => {
      const res = await request(app).get("/produtos?nome=");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: '"nome" não pode ser vazio!' });
    });

    it("Lista um produto pelo ID", async () => {
      (produto.findById as jest.Mock).mockResolvedValue(produtoMock);
      const res = await request(app).get(
        "/produtos/nomeOuId?id=66ff0f00e961f5caede885b4",
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual(produtoMock);
    });

    it("Retorna 404 se o produto não for encontrado pelo ID", async () => {
      (produto.findById as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get(
        "/produtos/nomeOuId?id=66ff0f00e961f5caede885b5",
      );
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Produto não encontrado!" });
    });
  });

  describe("POST /produtos", () => {
    it("Cria um novo produto", async () => {
      const novoProduto = {
        nome: "Produto Teste",
        categoria: "Espaços",
        disponibilidade: [{ data: "2024-10-10", horario: "08:00" }],
        preco: 150,
      };

      (produto.create as jest.Mock).mockResolvedValue(novoProduto);
      const res = await request(app).post("/produtos").send(novoProduto);
      expect(res.status).toBe(201);
      expect(res.body).toEqual("Produto cadastrado com sucesso!");
    });

    it("Retorna erro 400 se faltar campo obrigatório", async () => {
      const produtoIncompleto = {
        nome: "Produto Teste",
        categoria: "Espaços",
      };

      const res = await request(app).post("/produtos").send(produtoIncompleto);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Todos os campos são obrigatórios!" });
    });
  });

  describe("PUT /produtos/:id", () => {
    it("Atualiza um produto", async () => {
      const produtoAtualizado = { nome: "Produto Atualizado", preco: 200 };

      (produto.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        produtoAtualizado,
      );
      const res = await request(app)
        .put("/produtos/66ff0f00e961f5caede885b4")
        .send(produtoAtualizado);
      expect(res.status).toBe(200);
      expect(res.body).toEqual("Produto atualizado com sucesso!");
    });

    it("Retorna 404 se o produto não for encontrado", async () => {
      (produto.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .put("/produtos/66ff0f00e961f5caede885b4")
        .send({ nome: "Produto Inexistente" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Produto não encontrado!" });
    });

    it("Retorna 400 se nenhum campo for enviado para atualização", async () => {
      const res = await request(app)
        .put("/produtos/66ff0f00e961f5caede885b4")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Pelo menos um campo deve ser atualizado!",
      });
    });
  });

  describe("DELETE /produtos/:id", () => {
    it("Deleta um produto com sucesso pelo ID", async () => {
      (produto.findByIdAndDelete as jest.Mock).mockResolvedValue(true);
      const res = await request(app).delete(
        "/produtos/66ff0f00e961f5caede885b4",
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Produto excluído com sucesso!" });
    });

    it("Retorna 404 se o produto não for encontrado", async () => {
      (produto.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      const res = await request(app).delete(
        "/produtos/66ff0f00e961f5caede885b4",
      );
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Produto não encontrado!" });
    });

    it("Retorna 400 se fornecer ID invalido", async () => {
      const res = await request(app).delete("/produtos/123");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "ID inválido!",
      });
    });

    it("Garante que o produto foi realmente excluído", async () => {
      const produtoMock = {
        nome: "Produto a ser excluído",
        id: "66ff0f00e961f5caede885b4",
      };
      (produto.findById as jest.Mock).mockResolvedValue(produtoMock);
      (produto.findByIdAndDelete as jest.Mock).mockResolvedValue(produtoMock);

      await request(app).delete("/produtos/66ff0f00e961f5caede885b4");

      (produto.findById as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get(
        "/produtos/nomeOuId?id=66ff0f00e961f5caede885b4",
      );
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Produto não encontrado!" });
    });
  });

  describe("Erro interno do servidor", () => {
    it("Retorna 500 ao listar produtos se algo der errado", async () => {
      (produto.find as jest.Mock).mockRejectedValue(
        new Error("Erro ao buscar produtos"),
      );
      const res = await request(app).get("/produtos");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Erro ao buscar produtos" });
    });

    it("Retorna 500 ao criar um produto se algo der errado", async () => {
      (produto.create as jest.Mock).mockRejectedValue(
        new Error("Erro ao criar produto"),
      );
      const res = await request(app)
        .post("/produtos")
        .send({
          nome: "Produto Erro",
          categoria: "Espaços",
          disponibilidade: [{ data: "2024-10-10", horario: "08:00" }],
          preco: 150,
        });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Erro ao criar produto" });
    });
  });
});
