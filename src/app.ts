import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';

import { connectDatabase } from "./config/postgreConnect";
import { connectRedis } from "./config/redis"
import mainRouter from "./routes/index";
import userRoutes from "./routes/user_routes";
import enterpriseRoutes from "./routes/enterprise_routes";
import productRoutes from "./routes/products_routes"


const app = express();

// configuração do cors
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

connectDatabase()
connectRedis();

app.use(express.json());
app.use(cookieParser());
// app.use(mainRouter);
app.use("/users", userRoutes);
app.use("/companies", enterpriseRoutes);
app.use("/products", productRoutes)

export default app;
