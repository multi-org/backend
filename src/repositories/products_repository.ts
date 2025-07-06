import { PrismaClient } from "@prisma/client";
import { ProductDtos, EquipmentProductCreateDto, ServiceProductCreateDto, SpaceProductCreateDto } from "@app/models/Product_models";

const prisma = new PrismaClient();

export class ProductsRepository {

    async createProduct(productData: ProductDtos) { 
        const product = await prisma.product.create({
            data: productData
        })
        return product;
    }

    async createServiceProduct(serviceProduct: ServiceProductCreateDto, productId: string) {
        const service = await prisma.servicesProduct.create({
            data: {
                ...serviceProduct,
                productId: productId
            }
        });
        return service;
        
    }

    async createSpaceProduct(spaceProduct: SpaceProductCreateDto, productId: string) {
        const space = await prisma.spaceProduct.create({
            data: {
                ...spaceProduct,
                productId: productId
            }
        });
        return space;

    }

    async createEquipmentProduct(equipmentProduct: EquipmentProductCreateDto, productId: string) {
        const equipment = await prisma.equipamentProduct.create({
            data: {
                ...equipmentProduct,
                productId: productId
            }
        });
        return equipment;
    }
}
