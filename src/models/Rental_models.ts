import { z } from "zod";

export const ChargingTypeEnum = z.enum(['POR_DIA', 'POR_HORA', 'AMBOS']);

export const RentStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);


export const ReservationSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  hours: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora deve estar no formato HH:MM")).optional().default([]),
})

export const RentalCreateSchema = z.object({
  productId: z.string().uuid("ID do produto deve ser um UUID válido"),
  chargingType: ChargingTypeEnum,
  reservations: z.array(ReservationSlotSchema)
    .min(1, "Deve haver pelo menos uma reserva selecionada")
    .refine(arr => arr.every(res => new Date(res.date) > new Date()), {
      message: "Todas as datas de reserva devem ser no futuro",
      path: ["reservations"]
    }),
  description: z.string().max(1000, "Descrição deve ter no máximo 1000 caracteres").optional(),
  activityTitle: z.string().min(1, "Título da atividade é obrigatório").max(255, "Título deve ter no máximo 255 caracteres"),
  activityDescription: z.string().max(1000, "Descrição da atividade deve ter no máximo 1000 caracteres").optional()
}).refine(data => {
  if (data.chargingType === 'POR_DIA') {
    return data.reservations.every(res => res.hours.length === 0);
  } else if (data.chargingType === 'POR_HORA') {
    return data.reservations.every(res => res.hours.length > 0);
  }
  return true; // Should not happen with strict enum
}, {
  message: "Para aluguéis POR_DIA, 'hours' deve ser vazio. Para aluguéis POR_HORA, 'hours' deve conter horários.",
  path: ["reservations"]
});

// Schema para filtros de busca de produtos disponíveis
export const ProductSearchFiltersSchema = z.object({
  type: z.enum(['SPACE', 'EQUIPMENT', 'SERVICE']).optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  minPrice: z.number().min(0, "Preço mínimo deve ser maior ou igual a zero").optional(),
  maxPrice: z.number().min(0, "Preço máximo deve ser maior ou igual a zero").optional(),
  search: z.string().optional(),
});

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



// Tipos TypeScript derivados dos schemas
export type RentalCreateInput = z.infer<typeof RentalCreateSchema>;
export type ProductSearchFilters = z.infer<typeof ProductSearchFiltersSchema>;
export type RentalStatusUpdate = z.infer<typeof RentalStatusUpdateSchema>;
export type WeeklyAvailability = z.infer<typeof WeeklyAvailabilitySchema>;
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