import exp from "constants";
import { z } from "zod";

// Enum para tipos de cobrança
export const ChargingTypeEnum = z.enum(['POR_DIA', 'POR_HORA']);

// Enum para status de aluguel
export const RentStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);

// Schema para criação de aluguel
export const RentalCreateSchema = z.object({
  productId: z.string().uuid("ID do produto deve ser um UUID válido"),
  startDate: z.string().datetime("Data de início deve ser uma data válida"),
  endDate: z.string().datetime("Data de fim deve ser uma data válida"),
  description: z.string().max(1000, "Descrição deve ter no máximo 1000 caracteres").optional(),
  chargingType: ChargingTypeEnum,
  activityTitle: z.string().min(1, "Título da atividade é obrigatório").max(255, "Título deve ter no máximo 255 caracteres"),
  activityDescription: z.string().max(1000, "Descrição da atividade deve ter no máximo 1000 caracteres").optional()
}).refine((data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: "Data de início deve ser anterior à data de fim",
    path: ["startDate"]
  }
).refine((data) => new Date(data.startDate) > new Date(),
  {
    message: "Data de início não pode ser no passado",
    path: ["startDate"]
  }
);

// Schema para filtros de busca de produtos disponíveis
export const ProductSearchFiltersSchema = z.object({
  type: z.enum(['SPACE', 'EQUIPMENT', 'SERVICE']).optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minPrice: z.number().min(0, "Preço mínimo deve ser maior ou igual a zero").optional(),
  maxPrice: z.number().min(0, "Preço máximo deve ser maior ou igual a zero").optional(),
  search: z.string().optional(),
}).refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: "Preço mínimo deve ser menor ou igual ao preço máximo",
    path: ["minPrice"]
  }
).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
  },
  {
    message: "Data de início deve ser anterior à data de fim",
    path: ["startDate"]
  }
);

// Schema para atualização de status de aluguel
export const RentalStatusUpdateSchema = z.object({
  status: RentStatusEnum,
  reason: z.string().max(500, "Motivo deve ter no máximo 500 caracteres").optional()
});

// Schema para disponibilidade semanal
export const WeeklyAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0, "Dia da semana deve ser entre 0 e 6").max(6, "Dia da semana deve ser entre 0 e 6"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário deve estar no formato HH:MM"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário deve estar no formato HH:MM"),
  isAvailable: z.boolean().default(true)
}).refine(
  (data) => {
    const start = data.startTime.split(':').map(Number);
    const end = data.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return startMinutes < endMinutes;
  },
  {
    message: "Horário de início deve ser anterior ao horário de fim",
    path: ["startTime"]
  }
);

// Schema para disponibilidade específica
export const SpecificAvailabilitySchema = z.object({
  startDate: z.string().datetime("Data de início deve ser uma data válida"),
  endDate: z.string().datetime("Data de fim deve ser uma data válida"),
  isAvailable: z.boolean().default(true),
  priceOverride: z.number().min(0, "Preço deve ser maior ou igual a zero").optional()
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: "Data de início deve ser anterior ou igual à data de fim",
    path: ["startDate"]
  }
);

// schema para confirmação do pagamento
export const PaymentConfirmationSchema = z.object({
  rentalId: z.string().uuid("ID do aluguel deve ser um UUID válido"),
  paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_SLIP']),
  transactionId: z.string().optional(),
  pixCode: z.string().optional()
});

// Tipos TypeScript derivados dos schemas
export type RentalCreateInput = z.infer<typeof RentalCreateSchema>;
export type ProductSearchFilters = z.infer<typeof ProductSearchFiltersSchema>;
export type RentalStatusUpdate = z.infer<typeof RentalStatusUpdateSchema>;
export type WeeklyAvailability = z.infer<typeof WeeklyAvailabilitySchema>;
export type SpecificAvailability = z.infer<typeof SpecificAvailabilitySchema>;
export type PaymentConfirmation = z.infer<typeof PaymentConfirmationSchema>;
export type ChargingType = z.infer<typeof ChargingTypeEnum>;
export type RentStatus = z.infer<typeof RentStatusEnum>;

// Funções de validação
export function validateRentalCreation(data: unknown) {
  return RentalCreateSchema.safeParse(data);
}

export function validateProductSearchFilters(data: unknown) {
  return ProductSearchFiltersSchema.safeParse(data);
}

export function validateRentalStatusUpdate(data: unknown) {
  return RentalStatusUpdateSchema.safeParse(data);
}

export function validateWeeklyAvailability(data: unknown) {
  return WeeklyAvailabilitySchema.safeParse(data);
}

export function validateSpecificAvailability(data: unknown) {
  return SpecificAvailabilitySchema.safeParse(data);
}

export function validatePaymentConfirmation(data: unknown) {
  return PaymentConfirmationSchema.safeParse(data);
}

// Interfaces para respostas da API
export interface RentalResponse {
  id: string;
  userId: string;
  productId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  discountApplied: number;
  status: RentStatus;
  description?: string;
  activityTitle: string;
  activityDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    title: string;
    type: string;
    category: string;
    imagesUrls: string[];
    dailyPrice?: number;
    hourlyPrice?: number;
    chargingModel: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  payment?: {
    id: string;
    status: string;
    method?: string;
    amount: number;
    transactionId?: string;
  };
}

export interface AvailabilityCheckResult {
  available: boolean;
  reason?: string;
  priceOverride?: number;
  conflictingRentals?: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DiscountInfo {
  discountRate: number;
  discountAmount: number;
  finalAmount: number;
  reason: string;
}

export interface RentalCalculation {
  baseAmount: number;
  discountAmount: number;
  totalAmount: number;
  chargingType: ChargingType;
  period: {
    days?: number;
    hours?: number;
  };
  pricePerUnit: number;
}

export interface PIXPaymentInfo {
  pixCode: string;
  qrCodeUrl?: string;
  expirationTime: Date;
  amount: number;
}

export enum chargingModel{
  POR_DIA = "POR_DIA",
  POR_HORA = "POR_HORA",
  AMBOS = "AMBOS"
}

export enum rentStatus{
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}