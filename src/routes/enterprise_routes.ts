import { Router } from "express";
import enterpriseController from "@app/controllers/enterprise_controller";
import { jwtRequired } from '@app/middlewares/global_middleware';
import {checkCompanyPermission, checkPermission} from '@app/middlewares/checkPermissions_middlewares';

const enterpriseRoutes = Router();
enterpriseRoutes.post('/', jwtRequired, checkPermission('create:company'), enterpriseController.createCompany);
enterpriseRoutes.get('/:companyId', jwtRequired, checkPermission('read:company'), enterpriseController.findEnterpriseById);
enterpriseRoutes.get('/all', jwtRequired, checkCompanyPermission('read:company'));

enterpriseRoutes.get('/invite/accept', jwtRequired, enterpriseController.acceptInvite);
enterpriseRoutes.post('/invite/:companyId', jwtRequired, checkPermission('invite:legal_representative'), enterpriseController.inviteLegalRepresentative);

enterpriseRoutes.post('/request/registration', jwtRequired, enterpriseController.requestCompanyRegistrationData);
enterpriseRoutes.get('/all/requests', jwtRequired, enterpriseController.getAllCompanyRequest);
enterpriseRoutes.post('/confirm/:cnpj', jwtRequired,  checkPermission('create:company'), enterpriseController.confirmCompanyCreationData);

export default enterpriseRoutes;