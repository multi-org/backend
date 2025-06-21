import { z } from 'zod';

export const createEnterpriseZode = z.object({
    enterpriseName: z.string().min(1, "Enterprise name is required"),
    enterpriseEmail: z.string().email("Invalid email format"),
    enterpriseDescription: z.string().optional(),
    enterpriseCnpj: z.string().min(18, "CNPJ must be at least 18 characters long"),
    microenterprise: z.boolean(),
    enterpriseMission: z.string().min(1, "Enterprise mission is required"),
    enterprisePhone: z.string().min(10, "Phone number must be at least 10 characters long"),
});


export interface createEnterpriseDTOS {
    enterpriseName: string,
    enterpriseEmail: string,
    enterpriseCnpj: string,
    microenterprise: boolean,
    enterpriseMission: string,
    enterpriseDescription?: string,
    enterprisePhone: string,
    legalRepresentatives: {
        idRepresentative: string,
    }[]
}

export type createEnterpriseZodeType = z.infer<typeof createEnterpriseZode>;