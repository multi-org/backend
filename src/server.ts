import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 8083;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando no link http://localhost:${PORT}/`);
  console.log(`Link da documentação: http://localhost:${PORT}/api-docs`);
});
