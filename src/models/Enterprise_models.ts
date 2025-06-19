import { z } from 'zod';

export const createEnterpriseZode = z.object({
    enterpriseName: z.string().min(1, "Enterprise name is required"),
    email: z.string().email("Invalid email format"),
    cnpjOrCpf: z.string().min(14, "CNPJ or CPF must be at least 14 characters long"),
    enterpriseMission: z.string().min(1, "Enterprise mission is required"),
    phone: z.string().min(10, "Phone number must be at least 10 characters long"),
})


export interface createEnterpriseDTOS {
    enterpriseName: string,
    email: string,
    cnpjOrCpf: string,
    enterpriseMission: string,
    phone: string,
}

export type createEnterpriseZodeType = z.infer<typeof createEnterpriseZode>;