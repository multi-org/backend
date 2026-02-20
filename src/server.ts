import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./config/postgreConnect";
import { connectRedis } from "./config/redis";

const PORT = process.env.PORT || 8083;
const HOST = process.env.HOST || "0.0.0.0";

// Iniciar o servidor primeiro
app.listen(PORT, HOST, async () => {
  console.log(`✅ Servidor rodando no link http://localhost:${PORT}/`);
  console.log(`Link da documentação: http://localhost:${PORT}/api-docs`);

  // Conectar aos serviços após o servidor estar rodando
  try {
    await connectDatabase();
    await connectRedis();

    // Importar jobs após conexões estabelecidas
    await import("@app/jobs/init");
  } catch (error) {
    console.error("Error connecting to services:", error);
  }
});
