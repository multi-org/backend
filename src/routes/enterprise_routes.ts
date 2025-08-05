import { Router } from "express";
import enterpriseController from "@app/controllers/enterprise_controller";
import { jwtRequired } from '@app/middlewares/global_middleware';
import {checkCompanyPermission, checkPermission} from '@app/middlewares/checkPermissions_middlewares';

// rotas básicas
const enterpriseRoutes = Router();
enterpriseRoutes.post('/', jwtRequired, checkPermission('create:company'), enterpriseController.createCompany);
enterpriseRoutes.get('/all', jwtRequired, enterpriseController.getAllCompanys);
enterpriseRoutes.get('/search/:searchTerm', jwtRequired, enterpriseController.searchEnterpriseMultipleFields);

// rotas de convite
enterpriseRoutes.get('/invite/accept', jwtRequired, enterpriseController.acceptInvite);
enterpriseRoutes.post('/invite/:companyId', jwtRequired, checkPermission('invite:legal_representative'), enterpriseController.inviteLegalRepresentative);

// rotas de solicitar cadastro
enterpriseRoutes.post('/request/registration', jwtRequired, checkPermission('request:registration_company'), enterpriseController.requestCompanyRegistrationData);
enterpriseRoutes.get('/all/requests', jwtRequired, checkPermission('readAll:company',), enterpriseController.getAllCompanyRequest);
enterpriseRoutes.post('/confirm/:cnpj', jwtRequired, checkPermission('accept:request_company'), enterpriseController.confirmCompanyCreationData);
enterpriseRoutes.delete("/reject/request/:cnpj", jwtRequired, checkPermission('reject:request_company'), enterpriseController.rejectCompanyRequest);

// rota genérica
enterpriseRoutes.get('/:companyId', jwtRequired, checkPermission('read:company'), enterpriseController.findEnterpriseById);

export default enterpriseRoutes;