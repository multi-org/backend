import { Router } from "express";
import { jwtRequired } from '@app/middlewares/global_middleware';
import questionsFrequently from '@app/controllers/frequentlyAskedQuestion_controller';

const questionsFrequentlyRoutes = Router();

questionsFrequentlyRoutes.post('/create', jwtRequired, questionsFrequently.createQuestion);

export default questionsFrequentlyRoutes;