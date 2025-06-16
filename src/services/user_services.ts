import userRepository from '@app/repositories/user_repository';
import { createUserDTOS } from '@app/models/models_user';
import { logger, CustomError } from '@app/utils/logger';
import { convertDateToDatabase, convertDateToUser , validationCpf } from '@app/utils/basicFunctions'
import { dataSave, delData, getData } from '@app/models/redis_models';
import { sendVerificationCodeToRedis, verifyCode } from '@app/utils/functionsToRedis';
import {generateToken} from "@app/middlewares/global_middleware"

import Queue from '@app/jobs/lib/queue'
import bcrypt from 'bcrypt';

export class UserServices {
    async createUser(userData: createUserDTOS) {
        logger.info("Initiating user registration process");

        const { name, email, password, phoneNumber, cpf, birthDate } = userData;

    
        const existingUser = await userRepository.findUserByEmail(email);
        if (existingUser) {
            logger.warn(`User with email ${email} already exists`);
            throw new CustomError("Email already registered", 400);
        }

        const ValidCpf = await validationCpf(cpf);
        if (ValidCpf.status !== 200) {
            logger.warn(`Invalid CPF: ${cpf}`);
            throw new CustomError(ValidCpf.message, ValidCpf.status);
        }

        const formattedBirthDate = await convertDateToDatabase(birthDate);

        const hashedPassword = await bcrypt.hash(password, 10);

        const userDataToCache = {
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            cpf,
            birthDate: formattedBirthDate
        }

        logger.info("Saving data to Redis");
        const cacheResult = await dataSave({ prefix: 'user_data', key: email, value: userDataToCache, ttl: 1200 });
        if(!cacheResult) {
            logger.error("Failed to save user data to Redis");
            throw new CustomError("Failed to save user data to Redis", 500);
        }

        const verificationCodeSend = await sendVerificationCodeToRedis(email);
        if (!verificationCodeSend) {
            logger.error("Failed to send verification code");
            throw new CustomError("Failed to send verification code", 500); 
        }

        logger.info("Verification code sent to email");
        await Queue.add('sendVerificationCode', { email, code: verificationCodeSend }, { priority: 4 });
        
        return {message: "Código enviado com sucesso para o email", email}
    }

    async validEmailAndCreateUser(email: string, body: object) {
        logger.info(`Validating email for user`);

        const { code, resendCode } = body as { code: string, resendCode?: boolean };

        if (resendCode === true) {
            const verificationCodeSend = await sendVerificationCodeToRedis(email);
            if (!verificationCodeSend) {
                logger.error("Failed to resend verification code");
                throw new CustomError("Failed to resend verification code", 500);
            }

            logger.info("Verification code sent to email");
            await Queue.add('sendVerificationCode', { email, code: verificationCodeSend }, { priority: 3 });
            return { message: "Código enviado para o email", email };
        }

        if (!code) {
            logger.warn("Verification code is required");
            throw new CustomError("Verification code is required", 400);
        }

        const codeIsValid = await verifyCode(email, code);
        if (!codeIsValid) {
            logger.warn("Invalid or expired code");
            throw new CustomError("Invalid or expired code", 400);
        }

        const cacheUserData = await getData('user_data', email);
        if (!cacheUserData) {
            logger.error("User data has expired or is invalid.");
            throw new CustomError("User data has expired or is invalid.", 400);
        }

        const userData = {
            ...cacheUserData,
            birthDate: typeof cacheUserData.birthDate === 'string'
                ? new Date(cacheUserData.birthDate)
                : cacheUserData.birthDate
        }

        const newUser = await userRepository.createUser({...userData, isEmailVerified: true});
        if (newUser === null || !newUser) {
            logger.error("Failed to create user in the database");
            throw new CustomError("Failed to create user in the database", 500);
        }

        await delData('user_data', email);
        await delData('verification_code', email);

        const token = await generateToken(newUser.userId, email)
        if (!token) {
            logger.error("Failed to generate JWT token");
            throw new CustomError("Failed to generate JWT token", 500);
        }

        logger.info("User created successfully and token generated");
        return {
            message: "User created successfully",
            token,
            userName: newUser.name,
        }
    }
}


export default new UserServices();