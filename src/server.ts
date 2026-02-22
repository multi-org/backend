import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 8083;

const server = app.listen(PORT, () => {
  console.log(`✅ Servidor rodando no link http://localhost:${PORT}/`);
});

// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  server.close(() => process.exit(1));
});