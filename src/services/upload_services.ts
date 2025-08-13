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
    const failedUploads: string[] = [];

    try {
      logger.info(`Starting uploadProductImage for product ${productId}`, {
        totalFiles: localFilePath.length,
        filePaths: localFilePath
      });
      
      if (!localFilePath || localFilePath.length === 0) {
      throw new CustomError('No file paths provided for upload', 400);
    }

      for (let i = 0; i < localFilePath.length; i++) {
        const filePath = localFilePath[i];
        
        logger.info(`Processing file ${i + 1}/${localFilePath.length}: ${filePath}`);

        // Verificar se arquivo existe
        if (!fs.existsSync(filePath)) {
          logger.warn(`File not found for product image upload: ${filePath}. Skipping.`);
          failedUploads.push(filePath);
          continue;
        }

        let uploadSuccessful = false;
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
          uploadSuccessful = true;

          logger.info(`Image uploaded successfully:`, {
            originalPath: filePath,
            cloudinaryUrl: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes
          });

        } catch (uploadError: any) {
          logger.error(`Failed to upload image ${filePath} to Cloudinary:`, {
            error: uploadError.message,
            stack: uploadError.stack,
            productId,
            filePath
          });
          failedUploads.push(filePath);
        } finally {
          await this.cleanupTempFile(filePath); // Limpar arquivo temporário individualmente 
        }
      }

      if (localFilePath.length > 0) {
        await this.cleanupTempDirectory(localFilePath[0]);
      }

      logger.info(`Finished processing product images for product ${productId}:`, {
        totalProcessed: localFilePath.length,
        successfulUploads: uploadedImageUrls.length,
        failedUploads: failedUploads.length,
        failedFiles: failedUploads,
        uploadedUrls: uploadedImageUrls
      });

      if (uploadedImageUrls.length === 0) {
        throw new CustomError(`No images were successfully uploaded for product ${productId}. All ${localFilePath.length} uploads failed.`, 500);
      }
      
      return uploadedImageUrls;

    } catch (error) {
      logger.error('Error in uploadProductImages service', { error });
      throw new CustomError('Erro ao fazer upload das imagens do produto no serviço', 500);
    }
  }

  async uploadDocumentPdfAssociation(localFilePath: string, userId: string, userCpf: string, companyId: string, requestType: string, position?: string): Promise<any> {
    
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
        documentUrl: result.secure_url,
        uploadedAt: new Date().toISOString(),
        requiredAt: new Date().toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'}),
        cloudinaryId: result.public_id,
      requestType,
        ...(requestType === 'representative' && { position })
    };
    
    const newRequestAssociationOrRepresentativeRedisData = await dataSave({ prefix: requestType, key: userId, value: associationData, ttl: 2678400 })
    if (!newRequestAssociationOrRepresentativeRedisData) {
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

  async deleteFileCloudinary(cloudinaryId: string): Promise<void> { 
    try {
      const result: UploadApiResponse = await cloudinary.uploader.destroy(cloudinaryId, {
        resource_type: "raw" 
      });

      if (result.result !== 'ok') {
        logger.error(`Failed to delete file with Cloudinary ID ${cloudinaryId}: ${result.result}`);
        throw new CustomError("Failed to delete file from Cloudinary", 500);
      }

      logger.info(`File with Cloudinary ID ${cloudinaryId} deleted successfully`);
    } catch (error) {
      logger.error(`Error deleting file with Cloudinary ID ${cloudinaryId}`, { error });
      throw new CustomError("Erro ao deletar arquivo do Cloudinary", 500);
    }
  }
}

export default new uploadService();
