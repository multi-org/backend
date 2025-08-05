import uploadService from "@app/services/upload_services";
import productRepository from "@app/repositories/products_repository";
import { logger, CustomError } from "@app/utils/logger";

export const uploadUserProfileImageJob = {
  key: "uploadUserProfileImage",
  async handle({ data }: { data: { localFilePath: string; userId: string } }) {
    const { localFilePath, userId } = data;

    try {
      logger.info(`Job: Starting uploadUserProfileImage for user`);

      const result = await uploadService.uploadUserProfileImage(
        localFilePath,
        userId
      );

      logger.info(
        `Job: uploadUserProfileImage completed successfully for user: ${userId}`
      );

      return {
        success: true,
        result: result.result,
        cloudinaryId: result.cloudinaryId,
        userId: result.userId,
      };
    } catch (error) {
      logger.error("Job: Error in uploadUserProfileImage", { error });
      throw new CustomError("Erro ao fazer upload da imagem do usuário", 500);
    }
  },
};

export const uploadDocumentPdfJob = {
  key: "uploadDocumentPdf",
  async handle({
    data,
  }: {
    data: {
      localFilePath: string;
      userId: string;
      userCpf: string;
      companyId: string;
      requestType: string;
      position?: string;
    };
  }) {
    const { localFilePath, userId, userCpf, companyId, requestType, position } = data;

    try {
      logger.info(`Job: Starting uploadDocumentPdf for user`);

      const result = await uploadService.uploadDocumentPdfAssociation(
        localFilePath,
        userId,
        userCpf,
        companyId,
        requestType,
        position
      );

      logger.info(`Job: uploadDocumentPdf completed successfully for user`);

      return {
        success: true,
        result: result.secure_url,
        cloudinaryId: result.public_id,
        userId: userId,
      };
    } catch (error) {
      logger.error("Job: Error in uploadDocumentPdf", { error });
      throw new CustomError("Erro ao fazer upload do documento PDF", 500);
    }
  },
};

export const uploadProductImagesJob = {
  key: "uploadProductImages",
  async handle({
    data,
  }: {
    data: { productId: string; imagePaths: string[] };
  }) {
    const { productId, imagePaths } = data;

    try {
      logger.info(`Job: Starting uploadProductImages for product`, {
        productId,
      });

      const uploadedImageUrls = await uploadService.uploadProductImage(
        imagePaths,
        productId
      );

      if (uploadedImageUrls.length > 0) {
        await productRepository.updateProduct(productId, {
          imagesUrls: uploadedImageUrls,
        });
        logger.info(
          `Product ${productId} updated with ${uploadedImageUrls.length} image URLs.`
        );
      } else {
        logger.warn(
          `No images were successfully uploaded for product ${productId}.`
        );
      }

      logger.info(
        `Job: uploadProductImages completed successfully for product`,
        { productId }
      );

      return {
        success: true,
        productId: productId,
        uploadedImageUrls: uploadProductImagesJob,
      };
    } catch (error) {
      logger.error("Job: Error in uploadProductImages", { error });
      throw new CustomError("Erro ao fazer upload das imagens do produto", 500);
    }
  },
};
