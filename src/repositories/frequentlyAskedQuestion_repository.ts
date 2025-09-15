import { PrismaClient } from "@prisma/client";


class FrequentlyAskedQuestionRepository { 
    private prisma = new PrismaClient();


    async createFAQ(question: string, userWhoAsked: string) {
        return await this.prisma.frequentlyAskedQuestion.create({
            data: {
                question,
                userWhoAsked
            }
        });
    }
}

export default new FrequentlyAskedQuestionRepository();