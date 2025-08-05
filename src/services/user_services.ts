import userRepository from "@app/repositories/user_repository";
import enterpriseRepository from "@app/repositories/enterprise_repository";
import enterpriseServices from "./enterprise_services";
import {
  createUserDTOS,
  UserAddress,
  requestUserAssociation,
} from "@app/models/User_models";
import {
  dataSave,
  delData,
  getData,
  getKeysByPrefix,
} from "@app/models/redis_models";

import { logger, CustomError } from "@app/utils/logger";
import {
  convertDateToDatabase,
  convertDateToUser,
  validationCpf,
  verifyBirthDate,
} from "@app/utils/basicFunctions";
import {
  sendVerificationCodeToRedis,
  verifyCode,
} from "@app/utils/functionsToRedis";

import { generateToken } from "@app/middlewares/global_middleware";

import Queue from "@app/jobs/lib/queue";
import bcrypt from "bcrypt";

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
    await Queue.add(
      "sendVerificationCode",
      { email, code: verificationCodeSend },
      { priority: 4 }
    );

    return { message: "Código enviado com sucesso para o email", email };
  }

  async validEmail(email: string, body: object) {
    logger.info(`Validating email for user`);

    const { code, resendCode } = body as { code: string; resendCode?: boolean };

    if (resendCode === true) {
      const verificationCodeSend = await sendVerificationCodeToRedis(email);
      if (!verificationCodeSend) {
        logger.error("Failed to resend verification code");
        throw new CustomError("Failed to resend verification code", 500);
      }

      logger.info("Verification code sent to email");
      await Queue.add(
        "sendVerificationCode",
        { email, code: verificationCodeSend },
        { priority: 3 }
      );
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

    const {
      name,
      email,
      password,
      phoneNumber,
      cpf,
      birthDate,
      isEmailVerified,
      preferences,
    } = userData;

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

    const existingUserByPhone =
      await userRepository.findUserByPhoneNumber(phoneNumber);
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

    const assignRoleUser = await userRepository.assignRoleToUser(newUser.userId, "commonUser");
    if(!assignRoleUser) {
      logger.error("Failed to assign role to user");
      throw new CustomError("Failed to assign role to user", 500);
    }

    const token = await generateToken(newUser.userId, email);
    if (!token) {
      logger.error("Failed to generate JWT token");
      throw new CustomError("Failed to generate JWT token", 500);
    }

    logger.info("User created successfully and token generated");
    return {
      message: "User created successfully",
      token,
      userName: newUser.name,
    };
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

    const userRoles = await userRepository.findUserById(user.userId);

    logger.info("User logged in successfully");
    return {
      token,
      userName: user.name,
      photoPerfil: user.profileImageUrl ? user.profileImageUrl : null,
      userRoles: userRoles?.userSystemRoles
        ? userRoles.userSystemRoles.map((rl) => rl.role)
        : [],
    };
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
      birthDate: await convertDateToUser(
        user.birthDate.toISOString().split("T")[0]
      ),
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      status: user.status,
      profile: user.profileImageUrl ? user.profileImageUrl : null,
    };
  }

  async createUserAddress(userId: string, AddressData: UserAddress) {
    logger.info("Creating user address");

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
      },
    };
  }

  async requestAssociationUser(
    userId: string,
    companyId: string,
    userCpf: string,
    localFilePath: string,
    requestType: string
  ) {
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

    const uploadDocumentPdf = await Queue.add(
      "uploadDocumentPdf",
      {
        localFilePath,
        userId,
        userCpf,
        companyId,
        requestType,
      },
      { priority: 1 }
    );
    if (!uploadDocumentPdf) {
      logger.error("Failed to upload document PDF");
      throw new CustomError("Failed to upload document PDF", 500);
    }

    logger.info("Document PDF uploaded successfully");

    return { message: "Association request created successfully" };
  }

  async getAllRepresentativeOrAssociateRequests(typeRequest: string) {
    logger.info("Retrieving all representative or associate requests");

    const keys = await getKeysByPrefix(typeRequest);
    if (!keys || keys.length === 0) {
      logger.warn(`No ${typeRequest} requests found`);
      throw new CustomError(`No ${typeRequest} requests found`, 404);
    }

    const representativeRequest = await Promise.all(
      keys.map(async (key) => {
        const associationsData = await getData(typeRequest, key);
        return { ...associationsData, userId: key };
      })
    );

    return await this.getFromCompaniesWithUserAndCompanyData(representativeRequest);
  }

  async requestsToCompanyConfirmation(userAssociation: string, typeRequest: string) {
    logger.info("Confirming association with company");

    const user = await this.getMe(userAssociation);

    const associationDataRedis = await getData(typeRequest, user.id);
    if (!associationDataRedis) {
      logger.warn("No association data found for userId:" + user.id);
      throw new CustomError("Association not found", 404);
    }

    let result;
    let roleLabel = "";

    if (typeRequest === 'associate') {
      result = await userRepository.addUserAsCompanyAssociate(user.id, associationDataRedis.companyId, associationDataRedis.documentUrl, associationDataRedis.userCpf);
      roleLabel = "association";
    }

    else if (typeRequest === 'representative') { 
      result = await enterpriseRepository.addLegalRepresentative(user.id, associationDataRedis.companyId, associationDataRedis.documentUrl)
      roleLabel = "representative";
    }

    if (!result) {
      logger.error(`Failed to create ${roleLabel} in the database`);
      throw new CustomError(`Failed to create ${roleLabel} in the database`, 500);
    }

    await delData(typeRequest, user.id);
    logger.info(`${typeRequest} confirmed successfully`);

    return {
      message: "Association confirmed successfully",
      [roleLabel as string]: result,
    } as Record<string, any>;
  }

  async requestsToCompanyReject(userId: string, companyId: string, typeRequest: string) {
    logger.info("Rejecting association with company");

    const user = await this.getMe(userId);

    const associationDataRedis = await getData(typeRequest, userId);
    if (!associationDataRedis) {
      logger.warn("No association data found for userId:" + userId);
      throw new CustomError("Association not found", 404);
    }

    if (associationDataRedis.companyId !== companyId) {
      logger.warn("Company ID does not match the association data");
      throw new CustomError(
        "Company ID does not match the association data",
        400
      );
    }

    await delData(typeRequest, userId);
    Queue.add(
      "deleteFileCloudinary",
      { cloudinaryId: associationDataRedis.cloudinaryId },
      { priority: 1 }
    );

    logger.info("Association rejected successfully");
    return { message: "Association rejected successfully" };
  }

  async deleteAllRequestsByCompanyId(companyId: string, typeRequest: string) {
    logger.info("Deleting all association requests");

    const keys = await getKeysByPrefix(typeRequest);
    if (!keys || keys.length === 0) {
      logger.warn("No association requests found");
      throw new CustomError("No association requests found", 404);
    }

    let deletedCount = 0;

    await Promise.all(
      keys.map(async (key) => {
        const associationsData = await getData("association", key);
        const isCompanyMatch = associationsData.companyId === companyId;

        if (isCompanyMatch) {
          await delData(typeRequest, key);
          Queue.add(
            "deleteFileCloudinary",
            { cloudinaryId: associationsData.cloudinaryId },
            { priority: 1 }
          );
          deletedCount++;
          logger.info(`Deleted association request for userId: ${key}`);
        }
      })
    );

    if (deletedCount === 0) {
      logger.warn(`No association requests found for company: ${companyId}`);
      throw new CustomError(
        "No association requests found for this company",
        404
      );
    }

    logger.info(
      `All association requests deleted successfully. Total deleted: ${deletedCount}`
    );
    return deletedCount;
  }

  private async getFromCompaniesWithUserAndCompanyData( associationRequests: requestUserAssociation[]) {
    logger.info("Fetching user and company data for association");

    const uniqueuserids = [
      ...new Set(associationRequests.map((request) => request.userId)),
    ];
    const userPromises = uniqueuserids.map(async (userId) => {
      try {
        const user = await userRepository.findUserById(userId);
        return { userId, user };
      } catch (error) {
        logger.warn(`User not found: ${userId}`);
        return { userId, user: null };
      }
    });

    const uniqueCompanyIds = [
      ...new Set(associationRequests.map((request) => request.companyId)),
    ];
    
    const companyPromises = uniqueCompanyIds.map(async (companyId) => {
      try {
        const company =
          await enterpriseRepository.findEnterpriseById(companyId);
        return { companyId, company };
      } catch (error) {
        logger.warn(`Company not found: ${companyId}`);
        return { companyId, company: null };
      }
    });

    const [usersResults, companiesResults] = await Promise.all([
      Promise.all(userPromises),
      Promise.all(companyPromises),
    ]);

    const usersMap = new Map(
      usersResults.map((result) => [result.userId, result.user])
    );
    const companiesMap = new Map(
      companiesResults.map((result) => [result.companyId, result.company])
    );

    const enrichedAssociations = associationRequests.map((request) => {
      const user = usersMap.get(request.userId);
      const company = companiesMap.get(request.companyId);

      return {
        ...request,
        userId: user
          ? {
              id: user.userId,
              name: user.name,
              email: user.email,
              profileImage: user.profileImageUrl || null,
            }
          : {
              id: request.userId,
              name: "⚠️ USUÁRIO REMOVIDO/INEXISTENTE",
              email: "❌ Possível atividade de BOT detectada",
              status: "SUSPICIOUS_REQUEST",
              alert:
                "Este pedido pode ter sido criado por um bot ou usuário que foi removido do sistema",
            },
        companyId: company
          ? {
              id: company.id,
              name: company.popularName || company.legalName,
              cnpj: company.cnpj,
            }
          : {
              id: request.companyId,
              name: "⚠️ EMPRESA REMOVIDA/INEXISTENTE",
              status: "COMPANY_NOT_FOUND",
              alert: "Esta empresa pode ter sido removida do sistema",
            },
      };
    });

    logger.info("User and company data fetched successfully");
    return enrichedAssociations;
  }
}

export default new UserServices();
