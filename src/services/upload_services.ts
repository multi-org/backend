import cloudinary from "@app/config/cloudinary";
import userRepository from "@app/repositories/user_repository";
import productsRepository from "@app/repositories/products_repository";
import { dataSave } from "@app/models/redis_models"
import { UploadApiResponse } from 'cloudinary';

import fs from "fs";
import { logger, CustomError } from "@app/utils/logger";
import path from "path";
import util from 'util';

const unlinkAsync = util.promisify(fs.unlink);

class uploadService {
  
  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
        logger.info(`Temporary file removed: ${filePath}`);
      }

    } catch (error) {
      logger.error(`Error removing temporary file: ${filePath}`, { error });
    }
  }

  private async cleanupTempDirectory(filePath: string): Promise<void> {
    try {
      const temDir = path.dirname(filePath);

      if (temDir.includes("temp_uploads") && fs.existsSync(temDir)) {
        fs.rmSync(temDir, { recursive: true, force: true });
        logger.info('Temporary directory removed:', temDir)
      }
    } catch (error) { 
      logger.error(`Error removing temporary directory: ${filePath}`, { error });
    }
    
  }

  static async cleanupAllTempDirectories() {
    const baseDir = path.resolve('temp_uploads');

    if (!fs.existsSync(baseDir)) return;
    
    try {
      fs.rmSync(baseDir, { recursive: true, force: true });
      logger.info('All temp directories cleaned up');
    } catch (error) {
      logger.error('Error cleaning up all temp directories:', error);
    }
  }

  async uploadUserProfileImage(localFilePath: string, userId: string): Promise<any> {
    
    try {
      if (!fs.existsSync(localFilePath)) {
        logger.error(`File not found: ${localFilePath}`);
        throw new CustomError("File not found", 404);
      }

      logger.info(`Starting upload for user profile image: ${userId}`);

      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: `users/${userId}`,
        public_id: `proffile_${userId}_${Date.now()}`,
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
          { format: "webp" },
        ],
      });

      logger.info(
        `User profile image uploaded to Cloudinary successfully: ${result.secure_url}`
      );

      const addImagesUser = await userRepository.addImageUser(
        userId,
        result.secure_url
      );
      if (!addImagesUser) {
        logger.error(`Failed to add image URL to user: ${userId}`);
        throw new CustomError("Failed to add image URL to user", 500);
      }

      await this.cleanupTempDirectory(localFilePath);

      logger.info(`User profile image URL added in PostgreSQL`);

      return {
        success: true,
        result: result.secure_url,
        cloudinaryId: result.public_id,
        userId: userId,
      };
    } catch (error) {
      logger.error('Error uploading user profile image in service', { error });
      throw new CustomError('Erro ao fazer upload da imagem de perfil do usuário no serviço', 500);
    }
  }

  async uploadProductImage(localFilePath: string[], productId: string): Promise<any[]>{
    const uploadedImageUrls: string[] = [];

    try {
      for (const filePath of localFilePath) {
        if (!fs.existsSync(filePath)) {
          logger.warn(`File not found for product image upload: ${filePath}. Skipping.`);
          continue; // Skip this file if it doesn't exist
        }

        try {
          logger.info(`Uploading product image: ${filePath} for product ${productId}`);
          const result = await cloudinary.uploader.upload(filePath, {
            folder: `products/${productId}`,
            public_id: `product_${productId}_${Date.now()}_${path.basename(filePath, path.extname(filePath))}`,
            resource_type: "image",
            transformation: [
              { width: 800, height: 600, crop: "limit" },
              { quality: "auto" },
              { format: "webp" } // otimizar o formato
            ],
          });
          uploadedImageUrls.push(result.secure_url);
          logger.info(`Image uploaded: ${result.secure_url}`);
        } catch (uploadError: any) {
          logger.error(`Failed to upload image ${filePath} to Cloudinary: ${uploadError.message}`);
        } finally {
          await this.cleanupTempFile(filePath); // Limpar arquivo temporário individualmente
        }
      }

      if (localFilePath.length > 0) {
        await this.cleanupTempDirectory(localFilePath[0]);
      }

      logger.info(`Finished processing product images for product ${productId}. Uploaded ${uploadedImageUrls.length} images.`);
      return uploadedImageUrls;

    } catch (error) {
      logger.error('Error in uploadProductImages service', { error });
      throw new CustomError('Erro ao fazer upload das imagens do produto no serviço', 500);
    }
  }

  async uploadDocumentPdf(localFilePath: string, userId: string, userCpf: string, companyId: string): Promise<any> {
    
    if (!fs.existsSync(localFilePath)) {
      logger.error(`File not found: ${localFilePath}`);
      throw new CustomError('Arquivo não encontrado para upload', 404);
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: `documents/request_association/${userId}`,
      public_id: `${userId}_${Date.now()}`,
      resource_type: "raw", 
      format: "pdf" 
    });

    logger.info(`Document PDF uploaded to Cloudinary successfully`);

    await this.cleanupTempDirectory(localFilePath);

    const associationData = {
        userId,
        companyId,
        userCpf,
        documentUrl: result.secure_url, // Corrigido: nome de propriedade válido
        uploadedAt: new Date().toISOString(),
        cloudinaryId: result.public_id
      };

    const newRequestAssociationRedisData = await dataSave({ prefix: 'association', key: userId, value: associationData, ttl: 2678400 })
    if (!newRequestAssociationRedisData) {
        logger.error("Failed to save association data in Redis");
        throw new CustomError("Failed to save association data", 500);
    }

    logger.info("Association data saved in Redis successfully");

    return {
      success: true,
      result: result.secure_url,
      cloudinaryId: result.public_id,
      userId: userId
    }
  }
}

export default new uploadService();
