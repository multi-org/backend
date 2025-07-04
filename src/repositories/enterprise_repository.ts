import { PrismaClient } from '@prisma/client';
import { createEnterpriseDTOS } from '@app/models/Enterprise_models';

const prisma = new PrismaClient();


export class EnterpriseRepository {
    async createEnterprise(enterpriseData: createEnterpriseDTOS) {
        const { legalRepresentatives, ...rest } = enterpriseData;
        const enterprise = await prisma.enterprise.create({
            data: {
                ...rest,
                legalRepresentatives: {
                    create: legalRepresentatives.map((rep: any) => ({
                        user: {
                            connect: { userId: rep.idRepresentative }
                        }
                    }))
                }
         
            }
        });
        return enterprise;
    }

    async findEnterpriseByCnpj(cnpj: string) {
        const enterprise = await prisma.enterprise.findFirst({
            where: {
                cnpj: cnpj,
                status: 'ACTIVE'
            },
        });

        return enterprise;
    }

    async findEnterpriseByEmail(email: string) {
        const enterprise = await prisma.enterprise.findFirst({
            where: {
                email: email,
                status: 'ACTIVE'
            },
        });

        return enterprise;
    }

    async findEnterpriseById(id: string) {
        const enterprise = await prisma.enterprise.findUnique({
            where: {
                id: id,
                status: 'ACTIVE'
            },
        });

        return enterprise;
    }
}

export default new EnterpriseRepository();