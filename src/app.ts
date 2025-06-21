import express from "express";
import cookieParser from "cookie-parser";

import { connectDatabase } from "./config/postgreConnect";
import { connectRedis } from "./config/redis"
import mainRouter from "./routes/index";
import userRoutes from "./routes/user_routes";
import enterpriseRoutes from "./routes/enterprise_routes";


const app = express();

connectDatabase()
connectRedis();

app.use(express.json());
app.use(cookieParser());
// app.use(mainRouter);
app.use("/users", userRoutes);
app.use("/enterprises", enterpriseRoutes);

export default app;
