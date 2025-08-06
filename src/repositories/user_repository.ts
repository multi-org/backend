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
                userSystemRoles: {
                    select: {
                        role: true
                    }
                },
                UserCompanyRole: {
                    select: {
                        role: true,
                        userId: true,
                        companyId: true,
                    }
                }
            }
        });
        return user;
    }

    async assignRoleToUser(userId: string, roleType: string) {
        return await prisma.userSystemRole.create({
            data: {
                userId: userId,
                role: roleType
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
        const userRole = await prisma.userSystemRole.findFirst({
            where: {
                userId: userId
            }
        })
        return userRole;
    }
    
    async updateRoleUser(userId: string, role: string) {
        return await prisma.userSystemRole.update({
            where: {
                userId_role: {
                    userId: userId,
                    role: role
                }
            },
            data: {
                role: role
            }
        });
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

    async findUserAssociateToCompany(userId: string, companyId: string) {
        return await prisma.companyAssociate.findUnique({
            where: {
                userId_companyId: { userId: userId, companyId: companyId }
            }
        })
    }

    async findUserRepresentativeToCompany(userId: string, companyId: string) {
        return await prisma.legalRepresentative.findUnique({
            where: {
                companyId_userId: { userId: userId, companyId: companyId }
            }
        })
    }
}


export default new UserRepository();