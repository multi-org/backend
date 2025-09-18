import questionFrequentilyService from '@app/services/frequentlyAskedQuestion_services';
import { AuthRequest } from "@app/middlewares/global_middleware";
import { Response } from "express";

class FrequentlyAskedQuestionController {
    
    async createQuestion(req: AuthRequest, res: Response) {
        const { question } = req.body;
        const userWhoAsked = req.userId!;

        try {
            const result = await questionFrequentilyService.createQuestion(question, userWhoAsked);
            return res.status(201).json({success: true, data: result});
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error) {
                return res.status((error as any).statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllQuestions(req: AuthRequest, res: Response) {
        try {
            const result = await questionFrequentilyService.getAllQuestions();
            return res.status(200).json({success: true, data: result});
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getQuestionById(req: AuthRequest, res: Response) { 
        const { questionId } = req.params;
        try {
            const result = await questionFrequentilyService.getQuestionById(questionId);
            return res.status(200).json({success: true, data: result});
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error) {
                return res.status((error as any).statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async updateQuestion(req: AuthRequest, res: Response) { 
        const { question } = req.body;
        const { questionId } = req.params;

        try {
            const result = await questionFrequentilyService.updateQuestion(questionId, question);
            return res.status(200).json({success: true, data: result});
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error) {
                return res.status((error as any).statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
    async answerQuestion(req: AuthRequest, res: Response) {
        const { answer } = req.body;
        const { questionId } = req.params;

        try {
            const result = await questionFrequentilyService.answerQuestion(questionId, answer);
            return res.status(200).json({success: true, data: result});
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error) {
                return res.status((error as any).statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async deleteQuestion(req: AuthRequest, res: Response) {
        const { questionId } = req.params;

        try {
            const result = await questionFrequentilyService.deleteQuestion(questionId);
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error) {
                return res.status((error as any).statusCode).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllUnansweredQuestions(req: AuthRequest, res: Response) {
        try {
            const result = await questionFrequentilyService.getAllUnansweredQuestions();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}
 
export default new FrequentlyAskedQuestionController();