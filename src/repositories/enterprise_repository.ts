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
        return await prisma.company.findFirst({
            where: {
                email: email,
                status: 'ACTIVE'
            },
        });
    }

    async findEnterpriseById(id: string) {
        return await prisma.company.findUnique({
            where: {
                id: id,
                status: 'ACTIVE'
            },
        });
    }

    async findAllEnterprises() {
        return await prisma.company.findMany({
            where: {
                status: 'ACTIVE'
            },
            include: {
                Address: true,
                legalRepresentatives: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findEnterpriseByPhone(phone: string) {
        return await prisma.company.findFirst({
            where: {
                phone: phone,
                status: 'ACTIVE'
            },
        });
    }

    async findEnterpriseByLegalName(legalName: string) {
        return await prisma.company.findFirst({
            where: {
                legalName: {
                    contains: legalName,
                    mode: 'insensitive'
                },
                status: 'ACTIVE'
            },
            take: 10
        });
    }

    async searchEnterpriseMultipleFields(searchTerm: string) {
        return await prisma.company.findMany({
            where: {
                OR: [
                    {
                        legalName: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        email: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        cnpj: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        popularName: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                ],
                status: 'ACTIVE'
            },
            take: 10
        });
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