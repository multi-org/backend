import { AuthRequest } from "@app/middlewares/global_middleware";
import { Response } from "express";
import { createUserZode } from "@app/models/User_models";

class EnterpriseController { 
    async createEnterprise(req: AuthRequest, res: Response) {
        const result = createUserZode.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return res.status(400).json({
                message: "Validation failed",
                errors: errors,
            });
        }
        try {
            const userId = req.userId;
            
            
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
     }
}

export default new EnterpriseController();