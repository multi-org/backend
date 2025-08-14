import { PrismaClient } from "@prisma/client";
import { ProductCreateInput, WeeklyAvailability } from "@app/models/Product_models";

const prisma = new PrismaClient();

export class ProductsRepository {

   private createWeeklyAvailabilityRecords(productId: string, weeklyAvailability: WeeklyAvailability) {
        if (!weeklyAvailability) return [];

        const availabilityRecords = [];
        const dayMap = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };

        for (const [day, config] of Object.entries(weeklyAvailability)) {
            if (config) {
                const dayIndex = dayMap[day as keyof typeof dayMap];
                if (dayIndex !== undefined) {
                    availabilityRecords.push({
                        productId,
                        dayOfWeek: dayIndex,
                        startTime: config.start,
                        endTime: config.end,
                    });
                }
            }
        }

        return availabilityRecords;
    }

    async createProduct(productData: ProductCreateInput, userId: string, ownerId: string) { 
        const { title, description, type, category, unity, chargingModel, weeklyAvailability, dailyPrice, hourlyPrice } = productData;

        const result = await prisma.$transaction(async (tx) => {
            
            const product = await tx.product.create({
                data: {
                    title,
                    description,
                    type,
                    category,
                    ownerId,
                    unity,
                    chargingModel,
                    hourlyPrice,
                    dailyPrice,
                    createdBy: userId,
                },
            });

            // Criar produto específico baseado no tipo
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
                    const { durationMinutes, requirements } = productData.serviceDetails || {};
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

            // Criar registros de disponibilidade semanal
            if (weeklyAvailability) {
                const weeklyAvailabilityRecords = this.createWeeklyAvailabilityRecords(product.id, weeklyAvailability);

                if (weeklyAvailabilityRecords.length > 0) {
                    await tx.productWeeklyAvailability.createMany({
                        data: weeklyAvailabilityRecords
                    });
                }
            }

            return { product, specificProduct }
        });

        return result;
    }

    async uploadImagesProducts(productId: string, imagesUrlsProducts: string[]) {
        const updateProducts = await prisma.product.update({
            where: { id: productId },
            data: {
                imagesUrls: imagesUrlsProducts
            }
        });

        return updateProducts;
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

    async findProductById(productId: string) {
        const product = await prisma.product.findUnique({
            where: {
                id: productId
            },
            include: {
                spaceProduct: true,
                servicesProduct: true,
                equipamentProduct: true,
                productAvailability: true,
                ProductWeeklyAvailability: true,
            }
        })

        return product;
    }

    async findAllProductsToSystem() {
        return  await prisma.product.findMany({
            where: { status: "ACTIVE" },
            include: {
                spaceProduct: true,
                servicesProduct: true,
                equipamentProduct: true,
                ProductWeeklyAvailability: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }

    async findProductsByOwnerId(ownerId: string) {
        return await prisma.product.findMany({
            where: {
                ownerId,
                status: "ACTIVE"
            },
            include: {
                    spaceProduct: true,
                    servicesProduct: true,
                    equipamentProduct: true,
                },
            orderBy: {
                createdAt: "desc"
            }
        });
    }

    async updateProduct(productId: string, updateData: Partial<ProductCreateInput>) {
        const { title, description, type, category, unity, chargingModel, weeklyAvailability, ...specificData } = updateData;

        const result = await prisma.$transaction(async (tx) => {
           
            const product = await tx.product.update({
                where: { id: productId},
                data: {
                    ...(title && { title }),
                    ...(description && { description }),
                    ...(category && { category }),
                    ...(unity && { unity }),
                    ...(chargingModel && { chargingModel }),
                },
            });
            
            // Atualizar disponibilidade semanal se fornecida
            if (weeklyAvailability) {
                // Remover disponibilidades existentes
                await tx.productWeeklyAvailability.deleteMany({
                    where: { productId }
                });

                // Criar novas disponibilidades
                const weeklyAvailabilityRecords = this.createWeeklyAvailabilityRecords(productId, weeklyAvailability);

                if (weeklyAvailabilityRecords.length > 0) {
                    await tx.productWeeklyAvailability.createMany({
                        data: weeklyAvailabilityRecords
                    });
                }
            }

            return product;
        });

        return result;
    }

    async deleteProduct(productId: string) {
        const deleteProduct = await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                status: "DELETED"
            }
        });

        return deleteProduct;
    }

    async getProductAvailability(productId: string, startDate: Date, endDate: Date) {
        const availability = await prisma.productAvailability.findMany({
            where: {
                productId,
                startDate: {
                    lte: endDate
                },
                endDate: {
                    gte: startDate
                }
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        const weeklyAvailability = await prisma.productWeeklyAvailability.findMany({
            where: {
                productId
            },
            orderBy: {
                dayOfWeek: 'asc'
            }
        });

        return {
            specificAvailability: availability,
            weeklyAvailability
        };
    }

    async createProductAvailability(productId: string, availabilityData: { startDate: Date, endDate: Date, isAvailable: boolean, priceOverride?: number }) {
        const availability = await prisma.productAvailability.create({
            data: {
                productId,
                ...availabilityData
            }
        });

        return availability;
    }

    async searchProductsMultipleFields(searchTerm: string) {
        return await prisma.product.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        category: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    }
                ],
                status: 'ACTIVE'
            },
            take: 10,
            include: {
                equipamentProduct: true,
                spaceProduct: true,
                servicesProduct: true,
                productAvailability: true,
            }
        })
    }
}

export default new ProductsRepository();