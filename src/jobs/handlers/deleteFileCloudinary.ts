import uploadService from "@app/services/upload_services";
import { logger, CustomError } from "@app/utils/logger";

export const deleteFileCloudinaryJob = {
    key: "deleteFileCloudinary",
    async handle({ data }: { data: { cloudinaryId: string } }) {
        const { cloudinaryId } = data;

        try {
            await uploadService.deleteFileCloudinary(cloudinaryId);
            logger.info(`File with Cloudinary ID ${cloudinaryId} deleted successfully`);
        } catch (error: any) {
            logger.error(`Failed to delete file with Cloudinary ID ${cloudinaryId}: ${error.message}`);
            throw new CustomError("Failed to delete file", 500);
        }
    }
}