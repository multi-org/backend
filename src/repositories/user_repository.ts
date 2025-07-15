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

    async findUserByCpf(cpf: string) {
        const user = await prisma.user.findFirst({
            where: {
                cpf: cpf,
                status: 'ACTIVE'
            }
        })
        return user;
    }

    async findUserByPhoneNumber(phoneNumber: string) {
        const user = await prisma.user.findFirst({
            where: {
                phoneNumber: phoneNumber,
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
                profileImageUrl: true,
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

    async findUserRole(userId: string) {
        const userRole = await prisma.userRole.findFirst({
            where: {
                userId: userId
            }
        })
        return userRole;
    }
    
    async updateRoleUser(userId: string, role: number, userRole: number) {
        const user = await prisma.userRole.update({
            where: {
                userId_roleId: {
                    userId: userId,
                    roleId: userRole
                }
            },
            data: {
                roleId: role
            }
        });

        return user;
    }

    async addUserAsCompanyAssociate(userId: string, companyId: string, documentUrl: string, userCpf: string) {
        const representative = await prisma.companyAssociate.create({
            data: {
                userId: userId,
                companyId: companyId,
                documentUrl: documentUrl,
                userCpf: userCpf
            }
        });

        return representative;
    }

    async addImageUser(userId: string, imagesUrls: string) {
        return await prisma.user.update({
            where: {
                userId: userId
            },
            data: {
                profileImageUrl: imagesUrls
            }
        });
    }

}

export default new UserRepository();