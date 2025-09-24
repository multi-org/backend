import rentalController from "@app/controllers/rental_controller";
import { Router } from "express";
import {jwtRequired} from "@app/middlewares/global_middleware";

const rentalRoutes = Router();

rentalRoutes.post('/request/:productId', jwtRequired, rentalController.createRentalRequest);
rentalRoutes.get('/my-rentals/:status', jwtRequired, rentalController.getUserRentals);

export default rentalRoutes;