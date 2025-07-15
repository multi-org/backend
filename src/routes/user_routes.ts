import { Router } from "express";
import userController from "@app/controllers/user_controllers";
import { jwtRequired } from '@app/middlewares/global_middleware';
import { uploadDocuments } from '@app/middlewares/upload_middlewares';
import {checkCompanyPermission, checkPermission} from '@app/middlewares/checkPermissions_middlewares';

const userRoutes = Router();

userRoutes.post('/sendCode-email', userController.sendCodeToEmail)
userRoutes.post('/validate-email', userController.validEmail);
userRoutes.post('/create', userController.createUser);
userRoutes.post('/login', userController.login);
userRoutes.post('/logout', jwtRequired, userController.logout);
userRoutes.get('/me', jwtRequired, userController.getMe);
userRoutes.post('/address', jwtRequired, userController.createAddress);

userRoutes.post('/request/association/:companyId', jwtRequired, uploadDocuments.single('raw'), userController.requestAssociation);
userRoutes.get("/all/associations/request", jwtRequired, checkPermission("get_all_requests:company_associate"), userController.getAllAssociations);
userRoutes.post("/association/confirmation/:userId", jwtRequired, checkCompanyPermission('accept:company_associate'), userController.associationToCompanyConfirmation);

export default userRoutes;