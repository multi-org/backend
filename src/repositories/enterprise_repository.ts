import { PrismaClient } from '@prisma/client';
import { createEnterpriseDTOS, companyAddress} from '@app/models/Enterprise_models';

const prisma = new PrismaClient();


export class EnterpriseRepository {
    async createEnterprise(enterpriseData: createEnterpriseDTOS, addressData: companyAddress) {
        const { legalRepresentatives, ...rest } = enterpriseData;
        const enterprise = await prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    ...rest,
                    legalRepresentatives: {
                        create: legalRepresentatives.map((rep: any) => ({
                            user: {
                                connect: { userId: rep.idRepresentative }
                            }
                        }))
                    },
                    createdBy: legalRepresentatives[0].idRepresentative, // Assuming the first representative is the creator
                }
            });

            const companyAddres = await tx.address.create({
                data: {
                    ...addressData,
                    company: {
                        connect: { id: company.id }
                    },
                    typeAddress: 'ENTERPRISE'
                }
            })
            return {
                ...company,
                address: companyAddres
            };
        });

        return enterprise;
    }
    

    async findEnterpriseByCnpj(cnpj: string) {
        const enterprise = await prisma.company.findFirst({
            where: {
                cnpj: cnpj,
                status: 'ACTIVE'
            },
        });
        return enterprise;
    }


    async findEnterpriseByEmail(email: string) {
        const enterprise = await prisma.company.findFirst({
            where: {
                email: email,
                status: 'ACTIVE'
            },
        });

        return enterprise;
    }

    async findEnterpriseById(id: string) {
        const enterprise = await prisma.company.findUnique({
            where: {
                id: id,
                status: 'ACTIVE'
            },
        });

        return enterprise;
    }

    async existingRepresentative(userId: string, enterpriseId: string) {
        const representative = await prisma.legalRepresentative.findFirst({
            where: {
                userId: userId,
                companyId: enterpriseId,
            }
        })
        return representative;
    }

    async addLegalRepresentative(userId: string, enterpriseId: string) {
        const representative = await prisma.legalRepresentative.create({
            data: {
                user: {
                    connect: { userId: userId }
                },
                company: {
                    connect: { id: enterpriseId }
                }
            }
        });
        return representative;
    }

    async findRoleByName(roleName: string) {
        const role = await prisma.role.findFirst({
            where: {
                name: roleName
            }
        });
        return role;
    }


}

export default new EnterpriseRepository();