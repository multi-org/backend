import { logger, CustomError } from "@app/utils/logger";
import { ProductCreateInput, validateWeeklyAvailability } from "@app/models/Product_models";

import productRepository from "@app/repositories/products_repository";
import enterpriService from './enterprise_services';

class ProductsServices {

    async createProduct(productData: ProductCreateInput, ownerId: string, userId: string) {
        logger.info("Starting product creation process", { 
            productTitle: productData.title, 
            productType: productData.type,
            ownerId,
            userId 
        });

        if (productData.weeklyAvailability && !validateWeeklyAvailability(productData.weeklyAvailability)) {
            logger.error("Invalid weekly availability provided");
            throw new CustomError("Horários de disponibilidade inválidos. Horário de início deve ser menor que o de fim.", 400);
        }

        let owner: any;
        switch (productData.ownerType) {
            case "ENTERPRISE":
                owner = await enterpriService.findEnterpriseById(ownerId);
                if (!owner) {
                    logger.error("Enterprise not found", { ownerId });
                    throw new CustomError("Enterprise not found", 404);
                }
                break;
            case "SUBSIDIARY":
                logger.error("Subsidiary logic not implemented yet");
                throw new CustomError("Lógica para subsidiária ainda não implementada", 501);
            default:
                logger.error("Invalid owner type provided");
                throw new CustomError("Invalid owner type provided", 400);
        }

        const existing = await productRepository.findProductByTitleOwnerIdAndType(productData.title, owner.id, productData.type);
        if (existing) {
            logger.error("Product with this title already exists for this enterprise");
            throw new CustomError("Product with this title already exists for this enterprise", 400);
        }

        await this.validateSpecificProductData(productData)

        const created = await productRepository.createProduct(productData, userId, ownerId);
        if (!created) {
            logger.error("Product creation failed - repository returned null");
            throw new CustomError("Product creation failed", 500);
        }

        logger.info("Product created successfully", { 
                productId: created.product.id,
                productTitle: created.product.title 
            });
        return created;
    }

    async getProductsByOwner(ownerId: string, page: number = 1, limit: number = 10) {
        logger.info("Fetching products by owner", { ownerId, page, limit });

        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;

        const result = await productRepository.findProductsByOwnerId(ownerId, page, limit);

        logger.info("Products fetched successfully");
        return result;
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
}

export default new ProductsServices();