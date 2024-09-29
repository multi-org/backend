import express from "express";
import conectarNaDB from "./config/dbConnect";

async function startApp() {
  try {
    const conexao = await conectarNaDB(); // Conexão com o banco de dados
    conexao.on("error", (erro) => {
      console.error("Erro ao conectar no banco de dados: " + erro);
    });

    conexao.once("open", () => {
      console.log("Conexão com o banco de dados realizada com sucesso");
    });
  } catch (error) {
    console.error("Erro durante a inicialização do banco de dados:", error);
  }
}

startApp();

const app = express();

export default app;
