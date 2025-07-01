import bcrypt from 'bcrypt';
import { CustomError, logger } from './logger';
import { getData, dataSave, delData } from '@app/models/redis_models';
import { generateRandomCode } from './basicFunctions';

export const verifyCode = async (email: string, code: string) => {
    const stored_code = await getData('verification_code', email);
    if (!stored_code) {
        return false;
    }
    return await bcrypt.compare(code, stored_code.code);
}

export const sendVerificationCodeToRedis = async (email: string) => {
    logger.info(`Sending verification code to Redis`);

    const code = await generateRandomCode();
    const hashCode = await bcrypt.hash(code, 10);
    const dictCode = {
        code: hashCode
    };

    const result = await dataSave({
        prefix: "verification_code",
        key: email,
        value: dictCode,
        ttl: 600 
    })
    if (!result) {
        logger.error("Failed to save verification code to Redis");
        throw new CustomError("Failed to save verification code to Redis", 500);
    }

    logger.info(`Verification code saved successfully`);
    return code;
};