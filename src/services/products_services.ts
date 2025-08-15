import { logger, CustomError } from "@app/utils/logger";
import { ProductCreateInput, validateWeeklyAvailability,  ProductWithRelations} from "@app/models/Product_models";
import Queue from '@app/jobs/lib/queue'

import productRepository from "@app/repositories/products_repository";
import enterpriService from './enterprise_services';
import userRepository from "@app/repositories/user_repository";

class ProductsServices {

    async createProduct(productData: ProductCreateInput, ownerId: string, userId: string, imagesFiles?: Express.Multer.File[]) {
        logger.info("Starting product creation process");

        if (productData.weeklyAvailability && !validateWeeklyAvailability(productData.weeklyAvailability)) {
            logger.error("Invalid weekly availability provided");
            throw new CustomError("Horários de disponibilidade inválidos. Horário de início deve ser menor que o de fim.", 400);
        }
        
        const existing = await productRepository.findProductByTitleOwnerIdAndType(productData.title, ownerId, productData.type);
        if (existing) {
            logger.error("Product with this title already exists for this enterprise");
            throw new CustomError("Product with this title already exists for this enterprise", 400);
        }

        await this.validateSpecificProductData(productData);
        await this.validateProductWithPrice(productData);

        const created = await productRepository.createProduct(productData, userId, ownerId);
        if (!created) {
            logger.error("Product creation failed - repository returned null");
            throw new CustomError("Product creation failed", 500);
        }

        if (imagesFiles && imagesFiles.length > 0) {
            const localFilePaths = imagesFiles.map(file => file.path);
            Queue.add('uploadProductImages', {
                imagePaths: localFilePaths,
                productId: created.product.id
            }, { priority: 1 });
        }

        logger.info("Product created successfully", { 
                productId: created.product.id,
                productTitle: created.product.title 
            });
        return created;
    }

    async getProductsByOwner(ownerId: string) {
        logger.info("Fetching products by owner", { ownerId });

        const result = await productRepository.findProductsByOwnerId(ownerId);
        const productsWithUserData = await Promise.all(
            result.map(product => this.productWithUserAndCompanyData(product))
        );

        logger.info("Products fetched successfully");
        return {
            ...result,
            products: productsWithUserData
        };
    }

    async getAllProducts() {
        logger.info("Fetching all products to System");

        const result = await productRepository.findAllProductsToSystem();
        const productsWithUserData = await Promise.all(
            result.map(product => this.productWithUserAndCompanyData(product))
        );

        logger.info("Products fetched successfully");
        return {
            products: productsWithUserData,
        };
    }

    async getProductById(productId: string) {
        logger.info("Fetching product by ID", { productId });

        const product = await productRepository.findProductById(productId);
        
        if (!product) {
            logger.error("Product not found", { productId });
            throw new CustomError("Produto não encontrado", 404);
        }

        if (product.status === 'DELETED') {
            logger.error("Product is deleted", { productId });
            throw new CustomError("Produto foi excluído", 410);
        }

        const productWithUserData = await this.productWithUserAndCompanyData(product);

        return productWithUserData;
    }

    async updateProduct(productId: string, updateData: Partial<ProductCreateInput>, imagesFiles?: Express.Multer.File[]) {
        logger.info("Starting product update process");

        const existingProduct = await this.getProductById(productId);

        if(updateData.weeklyAvailability && !validateWeeklyAvailability(updateData.weeklyAvailability)) {
            logger.error("Invalid weekly availability provided");
            throw new CustomError("Horários de disponibilidade inválidos. Horário de início deve ser menor que o de fim.", 400);
        }

        if (updateData.title && updateData.title !== existingProduct.title) {
            const existing = await productRepository.findProductByTitleOwnerIdAndType(updateData.title, existingProduct.ownerId, existingProduct.type);

            if (existing && existing.id !== productId) {
                logger.error("Product with this title already exists for this enterprise", { title: updateData.title });
                throw new CustomError("Product with this title already exists for this enterprise", 409);
            }
        }

        const update = await productRepository.updateProduct(productId, updateData);
        if (!update) {
            logger.error("Product update failed - repository returned null", { productId });
            throw new CustomError("Product update failed", 500);
        }
        
        if (imagesFiles && imagesFiles.length > 0) {
            const localFilePaths = imagesFiles.map(file => file.path);
            Queue.add('uploadProductImages', {
                images: localFilePaths, 
                productId: productId 
            }, { priority: 1 });
        }

        logger.info("Product updated successfully", { productId, updateData });
        return update;
    }

    async deleteProduct(productId: string, userId: string) {
        logger.info("Starting product deletion process")

        await this.getProductById(productId);

        const deleted = await productRepository.deleteProduct(productId);
        if (!deleted) {
            logger.error("Product deletion failed - repository returned null", { productId });
            throw new CustomError("Product deletion failed", 500);
        }
        logger.info("Product deleted successfully", { productId });
        return deleted;
    }

    async getProductAvailability(productId: string, starDate: Date, endDate: Date) {
        logger.info("Fetching product availability");

        await this.getProductById(productId);

        const availability = await productRepository.getProductAvailability(productId, starDate, endDate);
        if (!availability) {
            logger.error("No availability found for this product", { productId });
            throw new CustomError("Nenhuma disponibilidade encontrada para este produto", 404);
        }

        logger.info("Product availability fetched successfully", { productId });
        return availability;
    }

    async setProductAvailability(productId: string, availabilityData: {
        startDate: Date;
        endDate: Date;
        isAvailable: boolean;
        priceOverride?: number;
    }) {
        logger.info("Setting product availability");

        await this.getProductById(productId);

        if (availabilityData.startDate >= availabilityData.endDate) {
            logger.error("Start date must be before end date", { availabilityData });
            throw new CustomError("A data de início deve ser anterior à data de término", 400);
        }

        if (availabilityData.priceOverride && availabilityData.priceOverride < 0) {
            logger.error("Price override must be a non-negative number", { priceOverride: availabilityData.priceOverride });
            throw new CustomError("O preço deve ser um número não negativo", 400);
        }

        const availability = await productRepository.createProductAvailability(productId, availabilityData);
        if (!availability) {
            logger.error("Failed to set product availability - repository returned null", { productId });
            throw new CustomError("Falha ao definir disponibilidade do produto", 500);
        }

        logger.info("Product availability set successfully", { productId, availabilityData });
        return availability;

    }

    async searchProductsMultipleFields(search: string) {
        logger.info("Searching products by multiple fields");

        if (!search || search.trim() === '') {
            logger.warn('No search term provided');
            throw new CustomError("Search term is required", 400);
        }

        const products = await productRepository.searchProductsMultipleFields(search);
        if (!products || products.length === 0) {
            logger.warn("No products found for the given search term", { search });
            throw new CustomError("Nenhum produto encontrado para o termo de pesquisa fornecido", 404);
        }   

        return products;
    }

    private async validateSpecificProductData(productData: ProductCreateInput) {
        switch (productData.type) {
            case "SPACE":
                if (!productData.spaceDetails) {
                    throw new CustomError("Space details are required for SPACE type products", 400);
                }
                if (productData.spaceDetails.capacity <= 0) {
                    throw new CustomError("Space capacity must be greater than zero", 400);
                }
                if (productData.spaceDetails.area <= 0) {
                    throw new CustomError("Space area must be greater than zero", 400);
                }
                break;
            case "SERVICE":
                if (productData.serviceDetails?.durationMinutes && productData.serviceDetails?.durationMinutes <= 0) {
                    throw new CustomError("Service duration must be greater than zero", 400);
                }
                break;
            case "EQUIPAMENT":
                if (!productData.equipmentDetails) {
                    throw new CustomError("Equipment details are required for EQUIPAMENT type products", 400);
                }
                if (productData.equipmentDetails.stock < 0) {
                    throw new CustomError("Equipment stock must be greater than or equal to zero", 400);
                }
                break;
            default:
                logger.error("Invalid product type provided", { productType: productData });
                throw new CustomError("Invalid product type provided", 400);
        }
    }

    private async validateProductWithPrice(productData: ProductCreateInput) {
        switch (productData.chargingModel) {
            case 'POR_DIA':
                if (!productData.dailyPrice || productData.dailyPrice === 0) {
                    logger.error("Daily price is required and must be greater than zero")
                    throw new CustomError("Preço da diária é obrigatório e deve ser maior que zero", 400)
                }
                break;
            case 'POR_HORA':
                if (!productData.hourlyPrice || productData.hourlyPrice === 0) {
                    logger.info("Hourly price is required and must be greater than zero")
                    throw new CustomError("Preço da hora é obrigatório e deve ser maior que zero", 400);
                }
                break;
            case 'AMBOS':
                if ((!productData.dailyPrice || productData.dailyPrice === 0) || (!productData.hourlyPrice || productData.hourlyPrice === 0)) {
                    logger.error("Both daily and hourly prices are required when charging model is AMBOS");
                    throw new CustomError("Preço diário e por hora são obrigatórios quando o modelo de cobrança é AMBOS", 400);
                }
                break;
            default:
                logger.error("Invalid charging model provided", { chargingModel: productData.chargingModel });
                throw new CustomError("Invalid charging model provided", 400);
        }
    }

    private async productWithUserAndCompanyData(product: ProductWithRelations) {
        const productWtihUserData = await userRepository.findUserById(product.createdBy);
        const company = await enterpriService.findEnterpriseById(product.ownerId);
        const weeklyAvailabilityMapped = product.ProductWeeklyAvailability 
        ? await this.mapProductWeeklyAvailability(product.ProductWeeklyAvailability)
             : {};
        
        logger.info("Products fetched successfully");
        return {
            ...product,
            ProductWeeklyAvailability: weeklyAvailabilityMapped,
            owner: company ? {
                name: company.legalName,
                ownerId: company.id,
                ownerType: company.ownerType,
                cnpj: company.cnpj,
                description: company.description,
                address: company.Address
            } : {
                name: "⚠️ EMPRESA REMOVIDA/INEXISTENTE",
                ownerId: product.ownerId,
                cnpj: "❌ Possível atividade de BOT detectada",
                status: "SUSPICIOUS_REQUEST",
                alert: "Este pedido pode ter sido criado por um bot ou usuário que foi removido do sistema"
            },
            createdBy: productWtihUserData ? {
                name: productWtihUserData.name,
                userId: productWtihUserData.userId,
                email: productWtihUserData.email
            } : {
                name: "⚠️ USUÁRIO REMOVIDO/INEXISTENTE",
                userId: product.createdBy,
                email: "❌ Possível atividade de BOT detectada",
                status: "SUSPICIOUS_REQUEST",
                alert: "Este pedido pode ter sido criado por um bot ou usuário que foi removido do sistema"
            },
        };
    }

    private async mapProductWeeklyAvailability(productWeeklyAvailability: any[]) {
    const dayMap: Record<number, string> = {
        0: "sunday",
        1: "monday",
        2: "tuesday", 
        3: "wednesday",
        4: "thursday",
        5: "friday",
        6: "saturday"
    };

    return productWeeklyAvailability.reduce((acc, availability) => {
        const dayOfWeek = availability.dayOfWeek;
        const dayName = dayMap[dayOfWeek];
        
        if (dayName && availability.isAvailable) {
            acc[dayName] = {
                start: availability.startTime,
                end: availability.endTime,
            };
        }
        return acc;
    }, {});
        
    }
}


export default new ProductsServices();