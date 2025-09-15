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

userRoutes.post('/request/associationOrLegalRepresentative/:companyId', jwtRequired, uploadDocuments.single('document'), userController.requestAssociation);
userRoutes.get("/all/associationOrLegalRepresentative/request", jwtRequired, checkPermission("get_all_requests:associateOrRepresentativeLegal"), userController.getAllRequests);
userRoutes.post("/associationOrLegalRepresentative/confirmation/:userId/:companyId", jwtRequired, checkCompanyPermission('accept:company_associateOrRepresentativeLegal'), userController.requestsToCompanyConfirmation);
userRoutes.delete("/associationOrLegalRepresentative/reject/:userId/:companyId", jwtRequired, checkCompanyPermission('reject:company_associate'), userController.requestsToCompanyReject);
userRoutes.delete("/all/associationOrLegalRepresentative/reject/:companyId", jwtRequired, checkCompanyPermission('reject:company_associate'), userController.deleteAllRequests);
userRoutes.post("/confirmPassword", jwtRequired, userController.confirmPassword);
userRoutes.put("/changePassword", jwtRequired, userController.changePasswordController);

export default userRoutes;