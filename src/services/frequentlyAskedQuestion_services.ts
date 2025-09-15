import questionFrequentily from "@app/repositories/frequentlyAskedQuestion_repository";
import userService from "./user_services";
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
}

export default new FrequentlyAskedQuestionServices();   