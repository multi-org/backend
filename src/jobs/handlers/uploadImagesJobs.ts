import uploadService from "@app/services/upload_services";
import { logger, CustomError } from "@app/utils/logger";
import { dataSave } from '@app/models/redis_models';

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
  key: 'uploadDocumentPdf',
  async handle({ data }: {
    data: { localFilePath: string; userId: string; userCpf: string; companyId: string }
  }) {
    const { localFilePath, userId, userCpf, companyId } = data;

    try {
      logger.info(`Job: Starting uploadDocumentPdf for user`);
      
      const result = await uploadService.uploadDocumentPdf(localFilePath, userId, userCpf, companyId);

      logger.info(`Job: uploadDocumentPdf completed successfully for user`);

      return {
        success: true,
        result: result.secure_url,
        cloudinaryId: result.public_id,
        userId: userId
      };

    } catch (error) {
      logger.error('Job: Error in uploadDocumentPdf', { error });
      throw new CustomError('Erro ao fazer upload do documento PDF', 500);
    }
  }
};
