import { AuthRequest } from "@app/middlewares/global_middleware";
import { Response } from "express";
import { createEnterpriseZode } from "@app/models/Enterprise_models";
import EnterpriseService from "@app/services/enterprise_services";
import jwt from 'jsonwebtoken';

class EnterpriseController { 

    async createCompany(req: AuthRequest, res: Response) {
        const result = createEnterpriseZode.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return res.status(400).json({
                message: "Validation failed",
                errors: errors,
            });
        }

        try {
            const userId = req.userId!;
            const response = await EnterpriseService.createEnterprise({
                ...result.data,
                legalRepresentatives: [{idRepresentative: userId}]
            });

            return res.status(200).json(response);
            
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }
    
    async findEnterpriseById(req: AuthRequest, res: Response) {
        const { companyId } = req.params;

        if (!companyId) {
            return res.status(400).json({ message: "Enterprise ID is required" });
        }

        try {
            const response = await EnterpriseService.findEnterpriseById(companyId);
            return res.status(200).json(response);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async inviteLegalRepresentative(req: AuthRequest, res: Response) {
        const { companyId } = req.params;
        const { email } = req.body;
    
        const userId = req.userId;

        try {
            await EnterpriseService.inviteLegalRepresentative(companyId, email, userId!);
            return res.status(200).json({ message: "Invitation sent successfully" });
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async acceptInvite(req: AuthRequest, res: Response) {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: "Token is required" });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRETJWT!) as unknown as { userId: string, enterpriseId: string, role: string };
            const { userId, enterpriseId, role } = decoded;

            const response = await EnterpriseService.acceptInvite(userId, enterpriseId, role);
            return res.status(200).json(response);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async requestCompanyRegistrationData(req: AuthRequest, res: Response) {
        const result = createEnterpriseZode.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return res.status(400).json({
                message: "Validation failed",
                errors: errors,
            });
        }
        try {
            const userId = req.userId!;
            const response = await EnterpriseService.requestCompanyRegistration(result.data, userId);
            return res.status(200).json({message: "Required data saved successfully", company: response});
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getAllCompanys(req: AuthRequest, res: Response) { 
        try {
            const companies = await EnterpriseService.getAllCompanys();
            return res.status(200).json({success: true, message: "Companies retrieved successfully", companies});
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getAllCompanyRequest(req: AuthRequest, res: Response) {
        try {
            const companies = await EnterpriseService.getAllCompanyRequest();
            return res.status(200).json(companies);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async confirmCompanyCreationData(req: AuthRequest, res: Response) {
        const { cnpj } = req.params;
        const legalRepresentatives = [{ idRepresentative: req.userId! }];

        if (!cnpj) {
            return res.status(400).json({ message: "CNPJ is required" });
        }

        try {
            const response = await EnterpriseService.confirmCompanyCreation(cnpj, legalRepresentatives);
            return res.status(200).json({message: "Successfully created company and added user as associate", company: response.popularName});
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async searchEnterpriseMultipleFields(req: AuthRequest, res: Response) {
        const { searchTerm } = req.params;
        if (!searchTerm || typeof searchTerm !== 'string') {
            return res.status(400).json({ message: "Search term is required" });
        }
        try {
            const response = await EnterpriseService.searchEnterpriseMultipleFields(searchTerm);
            return res.status(200).json({message: 'Empresa encontrada com sucesso', response});
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async rejectCompanyRequest(req: AuthRequest, res: Response) {
        const { cnpj } = req.params;
        if (!cnpj) {
            return res.status(400).json({success: false, message: "CNPJ is required"});
        }

        try {
            const response = await EnterpriseService.rejectCompanyRequest(cnpj);
            return res.status(200).json({success: response, message: "Request rejected successfully"});
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }
}

export default new EnterpriseController();