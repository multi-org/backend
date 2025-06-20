import { PrismaClient } from "@prisma/client";
import { createUserDTOS } from '@app/models/models_user';
import { UUID } from "crypto";


const prisma = new PrismaClient();

export class UserRepository {

    async createUser(userData: createUserDTOS) {
        const user = await prisma.user.create({
            data: userData
        })
        return user;
    }

    async findUserByEmail(email: string) {
        const user = await prisma.user.findFirst({
            where: {
                email: email,
                status: 'ACTIVE'
            }
        })
        return user;
    }

    async findUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: {
                userId: userId,
                status: 'ACTIVE'
            }
        })
        return user;
    }
}

export default new UserRepository();