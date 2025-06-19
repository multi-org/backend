import { logger, CustomError } from "@app/utils/logger";
import { validationCnpj, validationCpf } from "@app/utils/basicFunctions";
import { dataSave, delData, getData } from "@app/models/redis_models";
import { sendVerificationCodeToRedis, verifyCode } from "@app/utils/functionsToRedis";
import { createEnterpriseDTOS } from "@app/models/Enterprise_models";

import enterpriseRepository from "@app/repositories/enterprise_repository";

class EnterpriseServices {
    async createEnterprise(enterpriseData: createEnterpriseDTOS) {
        logger.info("Starting enterprise registration process");

        const { enterpriseName, email, cnpjOrCpf, enterpriseMission, phone } = enterpriseData;

        let isValidCnpjOrCpf;
        if (cnpjOrCpf.length > 14 && cnpjOrCpf.length <= 18) {
            isValidCnpjOrCpf = await validationCnpj(cnpjOrCpf);
        } else if (cnpjOrCpf.length > 11 && cnpjOrCpf.length <= 14) {
            isValidCnpjOrCpf = await validationCpf(cnpjOrCpf);
        } else {
            throw new CustomError("CNPJ or CPF must be 11 or 18 characters long", 400);
        }

        if (isValidCnpjOrCpf.status !== 200) {
            logger.warn(`Invalid CNPJ/CPF: ${cnpjOrCpf}`);
            throw new CustomError(isValidCnpjOrCpf.message, isValidCnpjOrCpf.status);
        }

        // Check if the enterprise already exists
        const existingEnterprise = await enterpriseRepository.findEnterpriseByEmail(email);
        if (existingEnterprise) {
            logger.warn(`Enterprise with email ${email} already exists`);
            throw new CustomError("Email already registered", 400);
        }

        return { message: "Enterprise registration initiated. Please verify your email.", status: 200 };
    }
}


export default new EnterpriseServices();