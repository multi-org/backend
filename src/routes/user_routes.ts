import { Router } from "express";
import userController from "@app/controllers/user_controllers";
import { jwtRequired } from '@app/middlewares/global_middleware';

const userRoutes = Router();

userRoutes.post('/create', userController.createUser);
userRoutes.post('/validate-email', userController.validationEmailAndCreateUser);

export default userRoutes;