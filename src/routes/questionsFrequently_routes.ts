import { Router } from "express";
import { jwtRequired } from '@app/middlewares/global_middleware';
import questionsFrequently from '@app/controllers/frequentlyAskedQuestion_controller';
import { checkPermission } from "@app/middlewares/checkPermissions_middlewares";

const questionsFrequentlyRoutes = Router();

questionsFrequentlyRoutes.post('/create', jwtRequired, questionsFrequently.createQuestion);
questionsFrequentlyRoutes.get('/all', questionsFrequently.getAllQuestions);
questionsFrequentlyRoutes.get('/question/:questionId', jwtRequired, questionsFrequently.getQuestionById);
questionsFrequentlyRoutes.put('/update/:questionId', jwtRequired, questionsFrequently.updateQuestion);
questionsFrequentlyRoutes.put('/answer/:questionId', jwtRequired, checkPermission('answer:question'), questionsFrequently.answerQuestion);
questionsFrequentlyRoutes.delete('/delete/:questionId', jwtRequired, checkPermission('delete:question'), questionsFrequently.deleteQuestion);
questionsFrequentlyRoutes.get('/unanswered', jwtRequired, questionsFrequently.getAllUnansweredQuestions);

export default questionsFrequentlyRoutes;