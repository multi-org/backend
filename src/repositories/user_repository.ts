import { PrismaClient } from "@prisma/client";
import { createUserDTOS } from '@app/models/User_models';

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
        const roleSelect = {
        id: true,
        name: true,
        description: true,
        rolesPermissions: {
            select: {
                permission: {
                    select: {
                        action: true,
                        resource: true,
                        description: true
                    }
                }
            }
        }
        };
        
        const user = await prisma.user.findUnique({
            where: {
                userId: userId,
                status: 'ACTIVE'
            },
            select: {
                name: true,
                email: true,
                userId: true,
                status: true,
                phoneNumber: true,
                cpf: true,
                isEmailVerified: true,
                birthDate: true,
                isPhoneVerified: true,
                userRoles: {
                    select: {
                        role: {
                            select: roleSelect
                        }
                    }
                },
                enterpriseUserRoles: true
            }
        });
        return user;
    }
}

export default new UserRepository();