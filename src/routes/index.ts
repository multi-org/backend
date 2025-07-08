import { Express, Request, Response } from "express";
import express from "express";
import produtos from "./products_routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const routes = (app: Express) => {
  app
    .route("/")
    .get((req: Request, res: Response) => res.status(200).send("API Node.js"));
  app.use(express.json(), produtos);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default routes;
