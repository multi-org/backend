import { PrismaClient } from "@prisma/client";
import { ProductCreateInput } from "@app/models/Product_models";

const prisma = new PrismaClient();

export class ProductsRepository {

    async createProduct(productData: ProductCreateInput, userId: string, ownerId: string) { 
        const { title, description, type, basePrice, category, imagesUrls, ownerType, unity  } = productData;
        
        const result = await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    title,
                    description,
                    type,
                    basePrice,
                    category,
                    imagesUrls,
                    ownerId,
                    ownerType,
                    unity,
                    createdBy: userId,
                },
            });

            let specificProduct;
            switch (type) {
                case "SPACE":
                    const { capacity, area } = productData.spaceDetails;
                    specificProduct = await tx.spaceProduct.create({
                        data: {
                            productId: product.id,
                            capacity: capacity,
                            area: area,
                        },
                    })
                    break;
                
                case "SERVICE":
                    const { durationMinutes, requirements } = productData.serviceDetails;
                    
                    specificProduct = await tx.servicesProduct.create({
                        data: {
                            productId: product.id,
                            durationMinutes: durationMinutes,
                            requirements: requirements
                        },
                    });
                    break;
                
                case "EQUIPAMENT":
                    const { brand, model, specifications, stock } = productData.equipmentDetails;
                    
                    specificProduct = await tx.equipamentProduct.create({
                        data: {
                            productId: product.id,
                            brand: brand,
                            model: model,
                            specifications: specifications,
                            stock: Number(stock),
                        },
                    });
                    break;
                
                default:
                    throw new Error("Type of Product Invalid")
            }

            return { product, specificProduct }
        });

        return result;
    }

    async findProductByTitleOwnerIdAndType(title: string, ownerId: string, type: any) {
        const product = await prisma.product.findFirst({
            where: {
                title,
                ownerId,
                type: type
            }
        });
        return product;
    }

    async deleteProduct(productId: string) {
        const deleteProduct = await prisma.product.delete({
            where: {
                id: productId
            }
        });
    }
}

export default new ProductsRepository();