import { Router } from "express";
import enterpriseController from "@app/controllers/enterprise_controller";
import { jwtRequired } from '@app/middlewares/global_middleware';

const enterpriseRoutes = Router();
enterpriseRoutes.post('/create', jwtRequired, enterpriseController.createEnterprise);
enterpriseRoutes.get('/', jwtRequired, enterpriseController.findEnterpriseById);

export default enterpriseRoutes;