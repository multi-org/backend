import { AddressType, PrismaClient } from "@prisma/client";
import { createUserDTOS, UserAddress } from '@app/models/User_models';

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
                            select: {
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
                            }
                        }
                    }
                },
                enterpriseUserRoles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
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
                            }
                        },
                        userId: true,
                    }
                }
            }
        });
        return user;
    }

    async findUserRoleByName(name: string) {
        const role = await prisma.role.findFirst({
            where: {
                name: name
            }
        })

        return role;
    }

    async assignRoleToUser(userId: string, roleId: number) { 
        return await prisma.userRole.create({
            data: {
                userId: userId,
                roleId: roleId
            }
        })
    }

    async createAdressUser(userId: string, addressData: UserAddress) {
        return await prisma.address.create({
            data: {
                ...addressData,
                userId: userId,
                typeAddress: AddressType.USER
            }
        })
    }

}

export default new UserRepository();