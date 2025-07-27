import { z } from "zod";

export const emailZode = z.string().email("Invalid email format");

export const createUserZode = z.object({
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z
    .string()
    .min(8, "Confirm password must be at least 8 characters long"),
  phoneNumber: z
    .string()
    .min(11, "Phone number must be at least 11 characters long"),
  cpf: z.string().length(14, "CPF must be exactly 11 characters long"),
  birthDate: z.string().refine((date: string) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, "Invalid date format"),
  preferences: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)]), {
    required_error: "Preferences are required",
  }).nonempty("Preferences cannot be empty"),
});

export const userCpfZode = z.string().length(14, "CPF must be exactly 14 characters long");

export interface createUserDTOS {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  cpf: string;
  birthDate: string;
  isEmailVerified: boolean;
  preferences: number[];
}

export interface UserAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export const UserAdressZode = z.object({
  street: z.string().min(1, "Street is required"),
  number: z.string().min(1, "Number is required"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

export type createUserZodeType = z.infer<typeof createUserZode>;
export type emailZode = z.infer<typeof emailZode>;
export type UserAdressZode = z.infer<typeof UserAdressZode>;
