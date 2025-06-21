import { logger, CustomError } from "@app/utils/logger";
import { validationCnpj, validationCpf } from "@app/utils/basicFunctions";
import { createEnterpriseDTOS } from "@app/models/Enterprise_models";

import enterpriseRepository from "@app/repositories/enterprise_repository";

class EnterpriseServices {
    async createEnterprise(enterpriseData: createEnterpriseDTOS) {
        logger.info("Starting enterprise registration process");

        if (!enterpriseData.legalRepresentatives || enterpriseData.legalRepresentatives.length === 0) {
            logger.warn('No legal representatives provided');
            throw new CustomError("At least one legal representative is required", 400);
        }

        const isValidCnpj = await validationCnpj(enterpriseData.enterpriseCnpj);
        if (isValidCnpj.status !== 200) {
            logger.warn('Invalid CNPJ provided');
            throw new CustomError(isValidCnpj.message, isValidCnpj.status);
        }

        const existingEnterprise = await enterpriseRepository.findEnterpriseByEmail(enterpriseData.enterpriseEmail);
        if (existingEnterprise) {
            logger.warn(`Enterprise already exists`);
            throw new CustomError("Email already registered", 400);
        }

        const newEnterprise = await enterpriseRepository.createEnterprise({ ...enterpriseData });
        if (!newEnterprise) {
            logger.error("Failed to create enterprise");
            throw new CustomError("Failed to create enterprise", 500);
        }

        return { message: "Successfully created company", status: 200, enterpriseName: newEnterprise.enterpriseName };
    }

    async findEnterpriseById(id: string) {
        logger.info(`Searching for enterprise`);

        if (!id) {
            logger.warn('No ID provided for enterprise search');
            throw new CustomError("Enterprise ID is required", 400);
        }

        const enterprise = await enterpriseRepository.findEnterpriseById(id);
        if (!enterprise) {
            logger.warn(`Enterprise with ID ${id} not found`);
            throw new CustomError("Enterprise not found", 404);
        }

        return { message: "Enterprise found", status: 200, enterprise };
    }
}


export default new EnterpriseServices();