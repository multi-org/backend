import { Router } from "express";
import userController from "@app/controllers/user_controllers";
import { jwtRequired } from '@app/middlewares/global_middleware';

const userRoutes = Router();

userRoutes.post('/sendCode-email', userController.sendCodeToEmail)
userRoutes.post('/validate-email', userController.validEmail);
userRoutes.post('/create', userController.createUser);
userRoutes.post('/login', userController.login);
userRoutes.post('/logout', jwtRequired, userController.logout);
userRoutes.get('/me', jwtRequired, userController.getMe);

export default userRoutes;