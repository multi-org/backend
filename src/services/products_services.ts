import { logger, CustomError } from "@app/utils/logger";
import { ProductCreateInput } from "@app/models/Product_models";
import productRepository from "@app/repositories/products_repository";
import enterpriService from './enterprise_services';

class ProductsServices {
    async createProduct(productData: ProductCreateInput) {
        logger.info("Starting product creation process");

        let owner: any;
        switch (productData.ownerType) {
            case "ENTERPRISE":
                owner = await enterpriService.findEnterpriseById(productData.ownerId);
                break;
            case "SUBSIDIARY":

            default:
                logger.error("Invalid owner type provided");
                throw new CustomError("Invalid owner type provided", 400);
        }

        const existing = await productRepository.findProductByTitleOwnerIdAndType(productData.title, owner.id, productData.type);
        if (existing) {
            logger.error("Product with this title already exists for this enterprise");
            throw new CustomError("Product with this title already exists for this enterprise", 400);
        }

        const created = await productRepository.createProduct(productData);
        if (!created) {
            logger.error("Product creation failed");
            throw new CustomError("Product creation failed", 500);
        }

        logger.info("Product created successfully");
        return created;
    }
}

export default new ProductsServices();