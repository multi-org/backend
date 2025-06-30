import { AuthRequest } from "@app/middlewares/global_middleware";
import { Response } from "express";
import { createEnterpriseZode } from "@app/models/Enterprise_models";
import EnterpriseService from "@app/services/enterprise_services";

class EnterpriseController { 
    async createEnterprise(req: AuthRequest, res: Response) {
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
        const { enterprise_id } = req.query as { enterprise_id?: string };

        if (!enterprise_id) {
            return res.status(400).json({ message: "Enterprise ID is required" });
        }

        try {
            const response = await EnterpriseService.findEnterpriseById(enterprise_id);
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