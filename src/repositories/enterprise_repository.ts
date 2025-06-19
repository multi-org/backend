import { PrismaClient } from '@prisma/client';
import { createEnterpriseDTOS } from '@app/models/Enterprise_models';

const prisma = new PrismaClient();


export class EnterpriseRepository {
    async createEnterprise(enterpriseData: createEnterpriseDTOS) {
        const enterprise = ""
        return enterprise;
    }

    async findEnterpriseByEmail(email: string) {
        const enterprise = await prisma.enterprise.findFirst({
            where: {
                email: email,
                // status: 'ACTIVE'
            },
        });

        return enterprise;
    }
}

export default new EnterpriseRepository();