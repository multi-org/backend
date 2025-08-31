import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

// Schema para disponibilidade semanal
const weeklyAvailabilitySchema = z.object({
  monday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  }).optional(),
  tuesday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  }).optional(),
  wednesday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  }).optional(),
  thursday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  }).optional(),
  friday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  }).optional(),
  saturday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  }).optional(),
  sunday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  }).optional(),
}).optional();

// Schema base para produtos
const ProductBaseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título deve ter no máximo 255 caracteres"),
  description: z.string().min(1, "Descrição é obrigatória").max(300, "Descrição deve ter no máximo 300 caracteres"),
  type: z.enum(["SPACE", "SERVICE", "EQUIPMENT"], {
    errorMap: () => ({ message: "Tipo deve ser SPACE, SERVICE ou EQUIPAMENT" })
  }),
  category: z.string().min(1, "Categoria é obrigatória").max(500, "Categoria deve ter no máximo 500 caracteres"),
  chargingModel: z.enum(["POR_DIA", "POR_HORA", "AMBOS"]).default("AMBOS"),
  unity: z.string().max(50, "Unidade deve ter no máximo 50 caracteres").optional(),

  dailyPrice: z.number().min(0, "Preço da diária deve ser positivo").optional(),
  hourlyPrice: z.number().min(0, "Preço da hora deve ser positivo").optional(),
  discountPercentage: z.number().min(1, "Porcentagem de desconto deve ser maior que 1").max(100, "O valor máximo de desconto não deve ser maior que 100%"),

  imagesUrls: z.array(z.string().url("URL de imagem inválida")).max(5, "Máximo de 5 URLs de imagens permitidas").optional(),

  weeklyAvailability: weeklyAvailabilitySchema,
});

// Schemas específicos para cada tipo de produto
const spaceProductSchema = z.object({
  capacity: z.number().int().min(1, "Capacidade deve ser um número inteiro positivo"),
  area: z.number().min(0.01, "Área deve ser maior que zero"),
});

const serviceProductSchema = z.object({
  durationMinutes: z.number().int().min(1, "Duração deve ser um número inteiro positivo").optional(),
  requirements: z.string().max(500, "Requisitos devem ter no máximo 500 caracteres").optional(),
});

const equipmentProductSchema = z.object({
  brand: z.string().max(100, "Marca deve ter no máximo 100 caracteres").optional(),
  model: z.string().max(100, "Modelo deve ter no máximo 100 caracteres").optional(),
  specifications: z.string().max(1000, "Especificações devem ter no máximo 1000 caracteres").optional(),
  stock: z.number().int().min(0, "Estoque não pode ser negativo").default(0),
});

// tipos
export type WeeklyAvailability = z.infer<typeof weeklyAvailabilitySchema>;

export type ProductCreateInput = z.infer<typeof ProductBaseSchema> & (
  { type: "SPACE"; spaceDetails: z.infer<typeof spaceProductSchema> } |
  { type: "SERVICE"; serviceDetails: z.infer<typeof serviceProductSchema> } |
  { type: "EQUIPMENT"; equipmentDetails: z.infer<typeof equipmentProductSchema> }
);

// Função de validação melhorada
export function validateProductCreation(data: any):
  { success: true; data: ProductCreateInput } |
  { success: false; error: z.ZodError } {
  
  
  // Validar dados base
  const baseResult = ProductBaseSchema.safeParse(data);
  if (!baseResult.success) {
    return baseResult;
  }

  const base = baseResult.data;
  let specificResult;
  let combineData: any = { ...base };

  // Validar dados específicos por tipo
  switch (base.type) {
    case "SPACE":
      if (!data.spaceDetails) {
        return {
          success: false,
          error: new z.ZodError([{
            code: z.ZodIssueCode.custom,
            path: ["spaceDetails"],
            message: "Detalhes do espaço são obrigatórios para produtos do tipo SPACE"
          }])
        };
      }
      specificResult = spaceProductSchema.safeParse(data.spaceDetails);
      if (specificResult.success) {
        combineData.spaceDetails = specificResult.data;
      }
      break;

    case "SERVICE":
      if (data.serviceDetails) {
        specificResult = serviceProductSchema.safeParse(data.serviceDetails);
        if (specificResult.success) {
          combineData.serviceDetails = specificResult.data;
        }
      } else {
        combineData.serviceDetails = {};
        specificResult = { success: true };
      }
      break;

    case "EQUIPMENT":
      if (!data.equipmentDetails) {
        return {
          success: false,
          error: new z.ZodError([{
            code: z.ZodIssueCode.custom,
            path: ["equipmentDetails"],
            message: "Detalhes do equipamento são obrigatórios para produtos do tipo EQUIPAMENT"
          }])
        };
      }
      specificResult = equipmentProductSchema.safeParse(data.equipmentDetails);
      if (specificResult.success) {
        combineData.equipmentDetails = specificResult.data;
      }
      break;

    default:
      return {
        success: false,
        error: new z.ZodError([{
          code: z.ZodIssueCode.custom,
          path: ["type"],
          message: "Tipo de produto inválido"
        }])
      };
  }

  if (!specificResult || !specificResult.success) {
    const errors = specificResult?.error?.issues || [];
    return {
      success: false,
      error: new z.ZodError(errors)
    };
  }

  return {
    success: true,
    data: combineData as ProductCreateInput
  };
}

// / Função auxiliar para validar disponibilidade semanal
export function validateWeeklyAvailability(availability: WeeklyAvailability): boolean {
  if (!availability) return true;

  for (const [day, config] of Object.entries(availability)) {
    if (config) {
      const startTime = config.start.split(':').map(Number);
      const endTime = config.end.split(':').map(Number);
      
      const startMinutes = startTime[0] * 60 + startTime[1];
      const endMinutes = endTime[0] * 60 + endTime[1];
      
      if (startMinutes >= endMinutes) {
        return false; // Horário de início deve ser menor que o de fim
      }
    }
  }
  
  return true;
}

export interface ProductWithRelations {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    category: string;
    chargingModel: string;
    unity: string | null;
    dailyPrice: Decimal | null;
  hourlyPrice: Decimal | null;
  discountPercentage: Decimal,
    ownerId: string;
    createdBy: string;
    createdAt: Date;
  updatedAt: Date;
  ProductWeeklyAvailability?: {
    dayOfWeek: number;
    isAvailable: boolean;
    startTime: string;
    endTime: string;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  servicesProduct?: {
    id: string;
    durationMinutes: number | null;
    requirements: string | null;
    productId: string;
  } | null;
  spaceProduct?: {
    id: string;
    capacity: number;
    area: number;
    productId: string;
  } | null;
  equipmentProduct?: {
    id: string;
    brand: string | null;
    model: string | null;
    specifications: string | null;
    stock: number;
    productId: string;
  } | null;
}

export interface productAvailabilityInterface{

  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  category: string;
  chargingModel: string;
  unity: string | null;
  dailyPrice: Decimal | null;
  hourlyPrice: Decimal | null;
  discountPercentage: Decimal,
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  ProductWeeklyAvailability: {
    dayOfWeek: number;
    isAvailable: boolean;
    startTime: string;
    endTime: string;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  productAvailability: {
    id: string;
    productId: string;
    startDate: Date;
    endDate: Date;
    isAvailable: boolean;
    priceOverride: Decimal | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  rents: {
    startDate: Date;
    endDate: Date;
    status: string;
  }[];
}
