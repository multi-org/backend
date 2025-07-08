import { z } from "zod";

const productSchemaZod = z.object({
  title: z.string().max(255, "Título deve ter no máximo 255 caracteres"),
  description: z.string().max(300, "Descrição deve ter no máximo 300 caracteres"),
  type: z.enum(["SPACE", "SERVICE", "EQUIPAMENT"]),
  basePrice: z.number().min(0, "Preço base não pode ser negativo"),
  category: z.string().max(500, "Categoria deve ter no máximo 500 caracteres"),
  imagesUrls: z.array(z.string()),
  ownerType: z.enum(["ENTERPRISE", "SUBSIDIARY"]),
  unity: z.enum(["UNIDADE", "HORA", "DIARIA"]).optional().default("UNIDADE"),
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

export type ProductCreateInput = z.infer<typeof productSchemaZod> & (
  { type: "SPACE"; spaceDetails: z.infer<typeof spaceProductSchema> } |
  { type: "SERVICE"; serviceDetails: z.infer<typeof serviceProductSchema> } |
  { type: "EQUIPAMENT"; equipmentDetails: z.infer<typeof equipmentProductSchema> }
);

export function validateProductCreation(data: any):
  { success: true; data: ProductCreateInput } |
  { success: false; error: z.ZodError } {
    const baseResult = productSchemaZod.safeParse(data);
  if (!baseResult.success) {  
    return baseResult;
  }

  const base = baseResult.data;
  let specificResult;
  let combineData: any = { ...base };
  switch (base.type) {
    case "SPACE":
      specificResult = spaceProductSchema.safeParse(data);
      if (specificResult.success) {
        combineData.spaceDetails = specificResult.data;
      }
      break;
    case "SERVICE":
      specificResult = serviceProductSchema.safeParse(data);
      if (specificResult.success) {
        combineData.serviceDetails = specificResult.data;
      }
      break;
    case "EQUIPAMENT":
      specificResult = equipmentProductSchema.safeParse(data);
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
    const errors = specificResult ? specificResult.error.issues : [];
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