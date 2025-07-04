import { z } from 'zod';

export const createEnterpriseZode = z.object({
    name: z.string().min(1, "Enterprise name is required"),
    email: z.string().email("Invalid email format"),
    cnpj: z.string().min(18, "CNPJ must be at least 18 characters long"),
    phone: z.string().min(15, "Phone number must be at least 15 characters long"),
    description: z.string().optional(),
    mission: z.string().optional(),
    isMicroenterprise: z.boolean(),
    
});


export interface createEnterpriseDTOS {
    name: string,
    email: string,
    cnpj: string,
    isMicroenterprise: boolean,
    mission?: string,
    description?: string,
    phone: string,
    legalRepresentatives: {
        idRepresentative: string,
    }[]
}

export type createEnterpriseZodeType = z.infer<typeof createEnterpriseZode>;