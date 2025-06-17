import "dotenv/config";
import app from "./src/app";
import cors from 'cors';
import './src/jobs/init.ts';

// configuração do cors
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:4000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 8083;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando no link http://localhost:${PORT}/`);
  console.log(`Link da documentação http://localhost:${PORT}/api-docs`);
});
