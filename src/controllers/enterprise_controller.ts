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

            return res.status(response.status).json(response);
            
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
            return res.status(response.status).json(response);
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
            return res.status(response.status).json(response);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

}

export default new EnterpriseController();