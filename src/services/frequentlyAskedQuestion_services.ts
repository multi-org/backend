import questionFrequentily from "@app/repositories/frequentlyAskedQuestion_repository";
import userRepository from "@app/repositories/user_repository";
import {logger, CustomError} from "@app/utils/logger";

class FrequentlyAskedQuestionServices {
    async createQuestion(question: string, userWhoAsked: string) {
        logger.info("Creating a new frequently asked question");

        const user = await userRepository.findUserById(userWhoAsked);
        if (!user) {
            logger.warn(`User not found`);
            throw new CustomError("User not found", 404);
        }

        if (question.trim().length === 0 || !question) {
            logger.warn("Question cannot be empty or undefined");
            throw new CustomError("Question cannot be empty or undefined", 400);
        }

        const createdQuestion = await questionFrequentily.createFAQ(question, user.userId);
        if (!createdQuestion) {
            logger.error("Failed to create the frequently asked question");
            throw new CustomError("Failed to create the frequently asked question", 500);
        }

        logger.info("Frequently asked question created successfully");
        return {success: true};
    }

    async getAllQuestions() {
        logger.info("Fetching all frequently asked questions");

        const questions = await questionFrequentily.GetAllQuestions();

        if (!questions) {
            logger.warn("No questions found");
            throw new CustomError("No questions found", 404);
        }

        logger.info("Frequently asked questions fetched successfully");
        return questions;
    }

    async getQuestionById(id: string) {
        logger.info(`Fetching question with ID: ${id}`);

        const question = await questionFrequentily.getQuestionById(id);

        if (!question) {
            logger.warn(`Question with ID: ${id} not found`);
            throw new CustomError("Question not found", 404);
        }

        logger.info(`Question with ID: ${id} fetched successfully`);
        return question;
    }

    async updateQuestion(id: string, question: string) {
        logger.info(`Updating question with ID: ${id}`);

        const existingQuestion = await questionFrequentily.getQuestionById(id);
        if (!existingQuestion) {
            logger.warn(`Question with ID: ${id} not found`);
            throw new CustomError("Question not found", 404);
        }

        if (question.trim().length === 0 || !question) {
            logger.warn("Question cannot be empty or undefined");
            throw new CustomError("Question cannot be empty or undefined", 400);
        }

        const updatedQuestion = await questionFrequentily.updateQuestion(id, question);
        if (!updatedQuestion) {
            logger.error(`Failed to update question with ID: ${id}`);
            throw new CustomError("Failed to update the question", 500);
        }

        if (updatedQuestion.question === existingQuestion.question) {
            logger.warn("No changes detected in the question");
            throw new CustomError("No changes detected in the question", 400);
        }

        logger.info(`Question with ID: ${id} updated successfully`);
        return updatedQuestion;
    }

    async answerQuestion(id: string, answer: string) {
        logger.info(`Answering question with ID: ${id}`);

        const existingQuestion = await questionFrequentily.getQuestionById(id);
        if (!existingQuestion) {
            logger.warn(`Question with ID: ${id} not found`);
            throw new CustomError("Question not found", 404);
        }

        if (answer.trim().length === 0 || !answer) {
            logger.warn("Answer cannot be empty or undefined");
            throw new CustomError("Answer cannot be empty or undefined", 400);
        }

        const answeredQuestion = await questionFrequentily.answerQuestion(id, answer);
        if (!answeredQuestion) {
            logger.error(`Failed to answer question with ID: ${id}`);
            throw new CustomError("Failed to answer the question", 500);
        }

        logger.info(`Question with ID: ${id} answered successfully`);
        return answeredQuestion;
    }

    async deleteQuestion(id: string) {
        logger.info(`Deleting question with ID: ${id}`);

        const existingQuestion = await questionFrequentily.getQuestionById(id);
        if (!existingQuestion) {
            logger.warn(`Question with ID: ${id} not found`);
            throw new CustomError("Question not found", 404);
        }

        const deletedQuestion = await questionFrequentily.deleteQuestion(id);
        if (!deletedQuestion) {
            logger.error(`Failed to delete question with ID: ${id}`);
            throw new CustomError("Failed to delete the question", 500);
        }

        logger.info(`Question with ID: ${id} deleted successfully`);
        return {success: true};
    }

    async getAllUnansweredQuestions() {
        logger.info("Fetching all unanswered frequently asked questions");

        const questions = await questionFrequentily.getAllUnansweredQuestions();

        if (!questions) {
            logger.warn("No unanswered questions found");
            throw new CustomError("No unanswered questions found", 404);
        }

        logger.info("Unanswered frequently asked questions fetched successfully");
        return questions;
    }
}

export default new FrequentlyAskedQuestionServices();   