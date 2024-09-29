import { Express, Request, Response } from "express";
import express from "express";
import produtos from "./produtosRoutes";

const routes = (app: Express) => {
  app
    .route("/")
    .get((req: Request, res: Response) => res.status(200).send("API Node.js"));
  app.use(express.json(), produtos);
};

export default routes;
