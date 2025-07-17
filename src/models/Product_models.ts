import { z } from "zod";

// Schema para disponibilidade semanal
const weeklyAvailabilitySchema = z.object({
  monday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    available: z.boolean()
  }).optional(),
  tuesday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    available: z.boolean()
  }).optional(),
  wednesday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    available: z.boolean()
  }).optional(),
  thursday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    available: z.boolean()
  }).optional(),
  friday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    available: z.boolean()
  }).optional(),
  saturday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    available: z.boolean()
  }).optional(),
  sunday: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    available: z.boolean()
  }).optional(),
}).optional();

// Schema base para produtos
const productSchemaZod = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título deve ter no máximo 255 caracteres"),
  description: z.string().min(1, "Descrição é obrigatória").max(300, "Descrição deve ter no máximo 300 caracteres"),
  type: z.enum(["SPACE", "SERVICE", "EQUIPAMENT"], {
    errorMap: () => ({ message: "Tipo deve ser SPACE, SERVICE ou EQUIPAMENT" })
  }),
  basePrice: z.number().min(0.01, "Preço base deve ser maior que zero"),
  category: z.string().min(1, "Categoria é obrigatória").max(500, "Categoria deve ter no máximo 500 caracteres"),
  imagesUrls: z.array(z.string().url("URL de imagem inválida")).optional().default([]),
  ownerType: z.enum(["ENTERPRISE", "SUBSIDIARY"], {
    errorMap: () => ({ message: "Tipo de proprietário deve ser ENTERPRISE ou SUBSIDIARY" })
  }),
  unity: z.string().max(50, "Unidade deve ter no máximo 50 caracteres").optional(),
  billingModel: z.enum(["POR_DIA", "POR_HORA", "POR_MES", "FIXO", "AMBOS"], {
    errorMap: () => ({ message: "Modelo de cobrança inválido" })
  }).default("POR_DIA"),
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

export type ProductCreateInput = z.infer<typeof productSchemaZod> & (
  { type: "SPACE"; spaceDetails: z.infer<typeof spaceProductSchema> } |
  { type: "SERVICE"; serviceDetails: z.infer<typeof serviceProductSchema> } |
  { type: "EQUIPAMENT"; equipmentDetails: z.infer<typeof equipmentProductSchema> }
);

// Função de validação melhorada
export function validateProductCreation(data: any):
  { success: true; data: ProductCreateInput } |
  { success: false; error: z.ZodError } {
  
  // Validar dados base
  const baseResult = productSchemaZod.safeParse(data);
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

    case "EQUIPAMENT":
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
    if (config && config.available) {
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