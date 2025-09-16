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

    async GetAllQuestions() {
        return await this.prisma.frequentlyAskedQuestion.findMany();
    }

    async getQuestionById(id: string) {
        return await this.prisma.frequentlyAskedQuestion.findUnique({
            where: { id }
        });
    }

    async updateQuestion(id: string, question: string) {
        return await this.prisma.frequentlyAskedQuestion.update({
            where: { id },
            data: { question }
        });
    }

    async answerQuestion(id: string, answer: string) {
        return await this.prisma.frequentlyAskedQuestion.update({
            where: { id },
            data: { answer}
        })
    }

    async deleteQuestion(id: string) {
        return await this.prisma.frequentlyAskedQuestion.delete({
            where: { id }
        });
    }

    async getAllUnansweredQuestions() {
        return await this.prisma.frequentlyAskedQuestion.findMany({
            where: { answer: null}
        })
    }
}

export default new FrequentlyAskedQuestionRepository();