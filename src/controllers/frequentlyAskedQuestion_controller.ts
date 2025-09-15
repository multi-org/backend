import questionFrequentilyService from '@app/services/frequentlyAskedQuestion_services';
import { AuthRequest } from "@app/middlewares/global_middleware";
import { Response } from "express";

class FrequentlyAskedQuestionController {
    async createQuestion(req: AuthRequest, res: Response) {
        const { question } = req.body;
        const userWhoAsked = req.userId!;

        try {
            const result = await questionFrequentilyService.createQuestion(question, userWhoAsked);
            return res.status(201).json(result);
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error) {
                return res.status((error as any).statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
 
export default new FrequentlyAskedQuestionController();