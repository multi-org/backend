import { z } from 'zod';

export const emailZode = z.string().email("Invalid email format");

export const createUserZode = z.object({
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long"),
    phoneNumber: z.string().min(17, "Phone number must be at least 17 characters long"),
    cpf: z.string().length(14, "CPF must be exactly 11 characters long"),
    birthDate: z.string().refine((date: string ) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    }, "Invalid date format"),
});

export interface createUserDTOS {
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    cpf: string,
    birthDate: string,
    isEmailVerified: boolean,
}

export type createUserZodeType = z.infer<typeof createUserZode>;
export type emailZode = z.infer<typeof emailZode>;