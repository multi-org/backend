import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDatabase } from "./config/postgreConnect";
import { connectRedis } from "./config/redis";
import mainRouter from "./routes/main_routes";

import '@app/jobs/init';

const app = express();

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// health check
app.get("/healthz", (req, res) => res.status(200).json({ status: "ok" }));

// rotas
app.use(mainRouter);

// Conexões DB/Redis
connectDatabase();
connectRedis();

export default app;
