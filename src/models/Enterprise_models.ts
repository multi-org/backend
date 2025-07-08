import { z } from 'zod';

export const createEnterpriseZode = z.object({
    popularName: z.string().min(1, "Enterprise name is required"),
    email: z.string().email("Invalid email format"),
    cnpj: z.string().min(18, "CNPJ must be at least 18 characters long"),
    phone: z.string().min(15, "Phone number must be at least 15 characters long"),
    description: z.string().optional(),
    legalName: z.string().optional(),
    isMicroenterprise: z.boolean(),
    street: z.string().min(1, "Street is required"),
    number: z.string().min(1, "Number is required"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Neighborhood is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
});

export interface EnterpriseDTOSWithAddress {
    popularName: string,
    email: string,
    cnpj: string,
    isMicroenterprise: boolean,
    legalName?: string,
    description?: string,
    phone: string,
    legalRepresentatives: {
        idRepresentative: string,
    }[],
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface companyAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface createEnterpriseDTOS {
    popularName: string,
    email: string,
    cnpj: string,
    isMicroenterprise: boolean,
    legalName?: string,
    description?: string,
    phone: string,
    legalRepresentatives: {
        idRepresentative: string,
    }[]
}

export type createEnterpriseZodeType = z.infer<typeof createEnterpriseZode>;