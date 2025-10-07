import rentalController from "@app/controllers/rental_controller";
import { Router } from "express";
import { jwtRequired } from "@app/middlewares/global_middleware";
import { checkPermission } from "@app/middlewares/checkPermissions_middlewares"

const rentalRoutes = Router();

rentalRoutes.post('/request/:productId', jwtRequired, rentalController.createRentalRequest);
rentalRoutes.get('/my-rentals', jwtRequired, rentalController.getUserRentals);
rentalRoutes.patch('/confirm/:rentalId', jwtRequired, rentalController.confirmRental);
rentalRoutes.get("/all", jwtRequired, checkPermission('get_all:rents'), rentalController.getAllRentals);
rentalRoutes.get('/byId/:rentalId', jwtRequired, rentalController.getRentalById);

export default rentalRoutes;