import { z } from "zod";

const productSchemaZod = z.object({
  title: z.string().max(255, "Título deve ter no máximo 255 caracteres"),
  description: z.string().max(300, "Descrição deve ter no máximo 300 caracteres"),
  type: z.enum(["SPACE", "SERVICE", "EQUIPAMENT"]),
  basePrice: z.number().min(0, "Preço base não pode ser negativo"),
  category: z.string().max(500, "Categoria deve ter no máximo 500 caracteres"),
  imagesUrls: z.array(z.string().optional()),
  ownerType: z.enum(["USER", "ENTERPRISE", "SUBSIDIARY"]),
});

const spaceProductSchema = z.object({
  capacity: z.number().int().min(1, "Capacidade deve ser um número inteiro positivo"),
  area: z.number().min(0, "Área não pode ser negativa"),
});

const serviceProductSchema = z.object({
  durationMinutes: z.number().int().min(0, "Duração deve ser um número inteiro não negativo").optional(),
  requirements: z.string().max(500, "Requisitos devem ter no máximo 500 caracteres").optional(),
});

const equipmentProductSchema = z.object({
  brand: z.string().max(100, "Marca deve ter no máximo 100 caracteres").optional(),
  model: z.string().max(100, "Modelo deve ter no máximo 100 caracteres").optional(),
  specifications: z.string().max(1000, "Especificações devem ter no máximo 1000 caracteres").optional(),
  stock: z.number().int().min(0, "Estoque não pode ser negativo").default(0), 
});

export function validateProductCreation(data: any) {

  const baseResult = productSchemaZod.safeParse(data);
  if (!baseResult.success) {  
    return baseResult;
  }

  const base = baseResult.data;

  let specificResult;
  switch (base.type) {
    case "SPACE":
      specificResult = spaceProductSchema.safeParse(data);
      break;
    case "SERVICE":
      specificResult = serviceProductSchema.safeParse(data);
      break;
    case "EQUIPAMENT":
      specificResult = equipmentProductSchema.safeParse(data);
      break;
    default:
      return {
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: { type: ["Tipo de produto Inválido"] }
          })
        }
      };
  }

  if(!specificResult.success) return specificResult;
  

  return {
    success: true,
    data: {
      ...base,
      ...specificResult
    }
  };
}

export interface ProductDtos { 
  title: string;
  description: string;
  ownerId: string;
  ownerType: "ENTERPRISE" | "SUBSIDIARY";
  type: "SPACE" | "EQUIPAMENT" | "SERVICE";
  basePrice: number;
  unity?: string;
  category: string;
  imagesUrls: string[];
}

export interface ServiceProductCreateDto{
  duration?: string; // Pode ser uma string representando o tempo, ex: "01:00:00"
  requirements?: string;
}

export interface SpaceProductCreateDto {
  capacity: number;
  area: number;
}

export interface EquipmentProductCreateDto {
  brand?: string;
  model?: string;
  specifications?: string;
  stock: number;
}

export type ProductCreateInput = ProductDtos & (
  | { type: "SPACE"; spaceDetails: SpaceProductCreateDto }
  | { type: "SERVICE"; serviceDetails: ServiceProductCreateDto }
  | { type: "EQUIPAMENT"; equipmentDetails: EquipmentProductCreateDto }
);