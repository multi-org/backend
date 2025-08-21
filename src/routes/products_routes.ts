import express from "express";
import ProdutoController from "../controllers/product_controller";
import rentalController from '@app/controllers/rental_controller';
import { jwtRequired } from "@app/middlewares/global_middleware";
import { checkCompanyPermission } from "@app/middlewares/checkPermissions_middlewares";
import { uploadImages } from "@app/middlewares/upload_middlewares";

const routes = express.Router();

routes.post("/:companyId", jwtRequired, checkCompanyPermission("create:product"), uploadImages.array("images"), ProdutoController.createProduct);
routes.post('/rents/request/:productIdParams', jwtRequired, rentalController.createRentalRequest);

routes.get("/details/:productId", jwtRequired, ProdutoController.getProductById);
routes.get("/search/:search", jwtRequired, ProdutoController.getProductsMultipleFields);
routes.get("/all", ProdutoController.getAlProducts);
routes.get('/calculate-price', jwtRequired, rentalController.createRentalRequest);

routes.get("/owner/:ownerId", jwtRequired, ProdutoController.getProductsOwner);

export default routes;

// Busca por nome e ID utilizam de query, ou seja a rota de ambas devem ser busca por query.
