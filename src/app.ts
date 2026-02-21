import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mainRouter from "./routes/main_routes";

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

app.get("/healthz", (req, res) => res.status(200).json({ status: "ok" }));

app.use(mainRouter);

export default app;
