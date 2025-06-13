import express from "express";
import cookieParser from "cookie-parser";

import { connectDatabase } from "./config/postgreConnect";
import { connectRedis } from "./config/redis"
import mainRouter from "./routes/index";


const app = express();

connectDatabase()
connectRedis();

app.use(express.json());
app.use(cookieParser());
app.use(mainRouter);

export default app;
