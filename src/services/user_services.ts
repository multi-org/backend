import userRepository from '@app/repositories/user_repository';
import enterpriseRepository from '@app/repositories/enterprise_repository';
import enterpriseServices from './enterprise_services';
import { createUserDTOS, UserAddress } from '@app/models/User_models';
import { dataSave, delData, getData, getKeysByPrefix } from '@app/models/redis_models';

import { logger, CustomError } from '@app/utils/logger';
import { convertDateToDatabase, convertDateToUser, validationCpf, verifyBirthDate } from '@app/utils/basicFunctions'
import { sendVerificationCodeToRedis, verifyCode } from '@app/utils/functionsToRedis';

import {generateToken} from "@app/middlewares/global_middleware"

import Queue from '@app/jobs/lib/queue'
import bcrypt from 'bcrypt';


export class UserServices {

    async sendCodeToEmail(email: string) {
        logger.info(`Send validation email`);

        const existingUser = await userRepository.findUserByEmail(email);
        if (existingUser) {
            logger.warn(`User with email ${email} already exists`);
            throw new CustomError("Email already registered", 400);
        }

        const verificationCodeSend = await sendVerificationCodeToRedis(email);
        if (!verificationCodeSend) {
            logger.error("Failed to send verification code");
            throw new CustomError("Failed to send verification code", 500);
        }

        logger.info("Verification code sent to email");
        await Queue.add('sendVerificationCode', { email, code: verificationCodeSend }, { priority: 4 });

        return { message: "Código enviado com sucesso para o email", email };

    }

    async validEmail(email: string, body: object) {
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

        logger.info("Verification code is valid");
        return { message: "Código verificado com sucesso", email };
    }


    async createUser(userData: createUserDTOS, confirmPassword: string) {
        logger.info("Initiating user registration process");

        const { name, email, password, phoneNumber, cpf, birthDate, isEmailVerified, preferences } = userData;

        if (password !== confirmPassword) {
            logger.warn("Passwords do not match");
            throw new CustomError("Passwords do not match", 400);
        }

        const ValidCpf = await validationCpf(cpf);
        if (ValidCpf.status !== 200) {
            logger.warn(`Invalid CPF: ${cpf}`);
            throw new CustomError(ValidCpf.message, ValidCpf.status);
        }

        const existingUserByCpf = await userRepository.findUserByCpf(cpf);
        if (existingUserByCpf) {
            logger.warn(`User already exists`);
            throw new CustomError("CPF already registered", 400);
        }

        const existingUserByPhone = await userRepository.findUserByPhoneNumber(phoneNumber);
        if (existingUserByPhone) {
            logger.warn(`User already exists`);
            throw new CustomError("Phone number already registered", 400);
        }

        const formattedBirthDate = await convertDateToDatabase(birthDate);

        const isBirthDateValid = await verifyBirthDate(formattedBirthDate);
        if (isBirthDateValid.status !== 200) {
            logger.warn(`Invalid birth date: ${await convertDateToUser(birthDate)}`);
            throw new CustomError(isBirthDateValid.message, isBirthDateValid.status);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserData = {
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            cpf,
            birthDate: new Date(formattedBirthDate).toISOString(),
            isEmailVerified: isEmailVerified,
            preferences: preferences,
        };


        const newUser = await userRepository.createUser(newUserData);
        if (newUser === null || !newUser) {
            logger.error("Failed to create user in the database");
            throw new CustomError("Failed to create user in the database", 500);
        }

        const defaultRoleName = await enterpriseRepository.findRoleByName('commonUser');
        if (!defaultRoleName) {
            logger.error("Default role not found");
            throw new CustomError("Default role not found", 500);
        }

        await userRepository.assignRoleToUser(newUser.userId, defaultRoleName.id);

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

    async login(email: string, password: string) {
        logger.info("Initiating user login process");

        const user = await userRepository.findUserByEmail(email);
        if (!user) {
            logger.warn(`User not found`);
            throw new CustomError("User not found", 404);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.warn("Invalid password");
            throw new CustomError("Invalid password", 422);
        }

        const token = await generateToken(user.userId, email);
        if (!token) {
            logger.error("Failed to generate JWT token");
            throw new CustomError("Failed to generate JWT token", 500);
        }

        logger.info("User logged in successfully");
        return {
            message: "Login successful",
            token,
            userName: user.name,
        }
    }

    async getMe(userId: string) {
        logger.info(`Fetching user by ID)`);

        const user = await userRepository.findUserById(userId);
        if (!user) {
            logger.warn(`User with ID ${userId} not found`);
            throw new CustomError("User not found", 404);
        }

        logger.info("User found successfully");
        return {
            id: user.userId,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            cpf: user.cpf,
            birthDate: await convertDateToUser(user.birthDate.toISOString().split('T')[0]),
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            status: user.status,
            profile: user.profileImageUrl ? user.profileImageUrl : null,
        };
    }

    async createUserAddress(userId: string, AddressData: UserAddress) {
        logger.info('Creating user address');

        if (!userId || !AddressData) {
            logger.warn("User ID and address data are required");
            throw new CustomError("User ID and address data are required", 400);
        }

        const address = await userRepository.createAdressUser(userId, AddressData);
        if (!address) {
            logger.error("Failed to create user address");
            throw new CustomError("Failed to create user address", 500);
        }

        logger.info("User address created successfully");
        return {
            message: "User address created successfully",
            address: {
                street: address.street,
                number: address.number,
                complement: address.complement,
                neighborhood: address.neighborhood,
                city: address.city,
                state: address.state,
                Cep: address.zipCode,
                country: address.country,
            }
        }
    }

    async requestAssociationUser(userId: string, companyId: string, userCpf: string, localFilePath: string) {
        logger.info("Starting association registration process");

        if (!userCpf) {
            logger.warn("User CPF not provided");
            throw new CustomError("User CPF not provided", 400);
        }

        const ValidCpf = await validationCpf(userCpf);
        if (ValidCpf.status !== 200) {
            logger.warn(`Invalid CPF: ${userCpf}`);
            throw new CustomError(ValidCpf.message, ValidCpf.status);
        }

        const user = await this.getMe(userId);
        await enterpriseServices.findEnterpriseById(companyId);

        if (userCpf !== user.cpf) {
            logger.warn("User CPF does not match the provided CPF");
            throw new CustomError("User CPF does not match the provided CPF", 400);
        }

        logger.info("User and company validated successfully");

        const uploadDocumentPdf = await Queue.add('uploadDocumentPdf', { localFilePath, userId, userCpf, companyId }, { priority: 1 });
        if (!uploadDocumentPdf) {
            logger.error("Failed to upload document PDF");
            throw new CustomError("Failed to upload document PDF", 500);
        }

        logger.info("Document PDF uploaded successfully");

        return {message: "Association request created successfully"};
    }

    async getAllAssociations() {
        logger.info("Retrieving all association requests");

        const keys = await getKeysByPrefix('association');
        if (!keys || keys.length === 0) {
            logger.warn("No association requests found");
            throw new CustomError("No association requests found", 404);
        }

        const associationRequest = await Promise.all(keys.map(async (key) => {
            const associationsData = await getData('association', key);
            return { ...associationsData, userId: key };
        }));

        const associationsWithUserData = await Promise.all(associationRequest.map(async (association) => {
            const userData = await this.getMe(association.userId);
            return association;
        }));

        return associationsWithUserData;
    }


    async associationToCompanyConfirmation(userAssociation: string) {
        logger.info("Confirming association with company");

        const user = await this.getMe(userAssociation);

        const associationDataRedis = await getData('association', user.id);
        if (!associationDataRedis) {
            logger.warn("No association data found for userId:" + user.id);
            throw new CustomError("Association not found", 404);
        }

        const createAssociation = await userRepository.addUserAsCompanyAssociate(user.id, associationDataRedis.companyId, associationDataRedis.documentUrl, associationDataRedis.userCpf);
        if(!createAssociation) {
            logger.error("Failed to create association in the database");
            throw new CustomError("Failed to create association in the database", 500);
        }
        await delData('association', user.id);  

        logger.info("Association confirmed successfully");
        return {
            message: "Association confirmed successfully",
            association: createAssociation
        };
    }
}


export default new UserServices();