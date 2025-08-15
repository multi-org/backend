import {
  validateProductCreation,
  ProductCreateInput,
} from "../models/Product_models";
import { AuthRequest } from "@app/middlewares/global_middleware";
import { Response, Request } from "express";

import productServices from "@app/services/products_services";

class ProdutoController {
  static async createProduct(req: AuthRequest, res: Response) {
    try {
      console.log(req.body);
      const parseBody = {
        ...req.body,
        hourlyPrice: req.body.hourlyPrice ? parseFloat(req.body.hourlyPrice) : undefined,
        dailyPrice: req.body.dailyPrice ? parseFloat(req.body.dailyPrice) : undefined,

        weeklyAvailability: req.body.weeklyAvailability ? JSON.parse(req.body.weeklyAvailability) : undefined,

        spaceDetails: {
          capacity: req.body.capacity ? parseInt(req.body.capacity) : undefined,
          area: req.body.area ? parseFloat(req.body.area) : undefined,
        },
        serviceDetails: {
          durationMinutes: req.body.durationMinutes ? parseInt(req.body.durationMinutes) : undefined,
        },
        equipmentDetails: {
          stock: req.body.stock ? parseInt(req.body.stock) : undefined,
        }
      };

      delete parseBody.capacity;
      delete parseBody.area;
      delete parseBody.images;
      delete parseBody.durationMinutes;
      delete parseBody.stock;

      const validationResult = validateProductCreation(parseBody);
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
      }

      const productData: ProductCreateInput = validationResult.data;
      const userId = req.userId!;
      const ownerId = req.params.companyId;

      const imagesFiles = req.files as Express.Multer.File[];

      const newProduct = await productServices.createProduct(
        productData,
        ownerId,
        userId,
        imagesFiles
      );

      return res.status(200).json({
        success: true,
        message: "Produto criado com sucesso",
        data: newProduct,
      });
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        message: error.message || "Internal Server Error",
      });
    }
  }

  static async getAlProducts(req: AuthRequest, res: Response) {
    try {
      const result = await productServices.getAllProducts();
      return res
        .status(200)
        .json({
          success: true,
          message: "Produtos listados com sucesso",
          data: result.products,
          statistics: {
            totalProducts: result.products.length,
            spaceCount: result.products.filter(p => p.type === 'SPACE').length,
            serviceCount: result.products.filter(p => p.type === 'SERVICE').length,
            equipmentCount: result.products.filter(p => p.type === 'EQUIPMENT').length,
          },
        });
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Erro interno do servidor",
      });
    }
  }

  static async getProductsOwner(req: AuthRequest, res: Response) {
    try {
      const { ownerId } = req.params;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: "ID do proprietário é obrigatório",
        });
      }

      const result = await productServices.getProductsByOwner(ownerId);

      return res.status(200).json({
        success: true,
        message: "Produtos listados com sucesso",
        data: result.products,
        statistics: {
          totalProducts: result.length,
        },
      });
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Erro interno do servidor",
      });
    }
  }

  static async getProductById(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "ID do produto é obrigatório",
        });
      }

      const product = await productServices.getProductById(productId);

      return res.status(200).json({
        success: true,
        message: "Produto encontrado com sucesso",
        data: product,
      });
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Erro interno do servidor",
      });
    }
  }

  static async getProductsMultipleFields(req: AuthRequest, res: Response) {
    try {
      const { search } = req.query;
      const products = await productServices.searchProductsMultipleFields(
        search as string
      );

      return res.status(200).json({
        success: true,
        message: "Produtos encontrados com sucesso",
        data: products,
      });
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Erro interno do servidor",
      });
    }
  }
}

export default ProdutoController;
