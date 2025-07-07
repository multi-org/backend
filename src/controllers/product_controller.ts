import {validateProductCreation, ProductDtos} from "../models/Product_models";
import { AuthRequest } from "@app/middlewares/global_middleware";
import { Response, Request} from "express";

import productServices from '@app/services/products_services';

class ProdutoController {
  static async createProduct(req: AuthRequest, res: Response) {
    const response = validateProductCreation(req.body);
    if (!response.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: response.error?.flatten().fieldErrors || {},
      });
    }

    try {
        const { ownerId } = req.params;
        const productData = {
          ...response.data,
          ownerId: ownerId,
        } as ProductDtos;

      const createProduct = await productServices.createProduct(productData);

      return res.status(200).json(createProduct)

    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        message: error.message || "Internal Server Error",
      });
    }
  }

  static async listarProdutos(req: AuthRequest, res: Response) {
  }

  static async listarProdutoPorNomeOuId(req: AuthRequest, res: Response) {
    
  }

  static async atualizarProduto(req: Request, res: Response) {
    
  }

  static async deletarProduto(req: Request, res: Response) {
    
  }


}

export default ProdutoController;
