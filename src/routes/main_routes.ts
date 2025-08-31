import { Router } from 'express';
import userRoutes from "./user_routes";
import enterpriseRoutes from "./enterprise_routes";
import productRoutes from "./products_routes"
import uploadRoutes from './upload_routes';
import availabilityRoutes from './availability_routes';

const router = Router();

router.use("/users", userRoutes);
router.use("/companies", enterpriseRoutes);
router.use("/availability", availabilityRoutes);

router.use("/products", productRoutes);
router.use("/upload", uploadRoutes);

export default router;