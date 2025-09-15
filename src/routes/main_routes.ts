import { Router } from 'express';
import userRoutes from "./user_routes";
import enterpriseRoutes from "./enterprise_routes";
import productRoutes from "./products_routes"
import availabilityRoutes from './availability_routes';
import questionsFrequentlyRoutes from './questionsFrequently_routes';

const router = Router();

router.use("/users", userRoutes);
router.use("/companies", enterpriseRoutes);
router.use("/availability", availabilityRoutes);
router.use("/faqs", questionsFrequentlyRoutes);
router.use("/products", productRoutes);

export default router;