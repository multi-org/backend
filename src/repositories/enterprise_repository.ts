import { PrismaClient } from '@prisma/client';
import { createEnterpriseDTOS } from '@app/models/Enterprise_models';

const prisma = new PrismaClient();


export class EnterpriseRepository {
    async createEnterprise(enterpriseData: createEnterpriseDTOS) {
        const { legalRepresentatives, ...rest } = enterpriseData;
        const enterprise = await prisma.enterprise.create({
            data: {
                ...rest,
                legalRepresentatives: legalRepresentatives
                    ? {
                        create: legalRepresentatives.map((rep: any) => ({
                            idRepresentative: rep.idRepresentative
                        }))
                    }
                    : undefined
            }
        });
        return enterprise;
    }

    async findEnterpriseByEmail(email: string) {
        const enterprise = await prisma.enterprise.findFirst({
            where: {
                enterpriseEmail: email,
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