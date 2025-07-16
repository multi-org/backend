import { logger, CustomError } from "@app/utils/logger";
import { validationCnpj, extractAddressData, extractCompanyData } from "@app/utils/basicFunctions";
import { EnterpriseDTOSWithAddress } from "@app/models/Enterprise_models";
import Queue from '@app/jobs/lib/queue'
import { generateInviteToken } from '@app/middlewares/global_middleware'
import { dataSave, delData, getData, getKeysByPrefix } from '@app/models/redis_models';

import userRepository from '@app/repositories/user_repository';
import enterpriseRepository from "@app/repositories/enterprise_repository";
import useServices from "./user_services";

class EnterpriseServices {
    async createEnterprise(enterpriseData: EnterpriseDTOSWithAddress) {
        logger.info("Starting enterprise registration process");

        if (!enterpriseData.legalRepresentatives || enterpriseData.legalRepresentatives.length === 0) {
            logger.warn('No legal representatives provided');
            throw new CustomError("At least one legal representative is required", 400);
        }

        const isValidCnpj = await validationCnpj(enterpriseData.cnpj);
        if (isValidCnpj.status !== 200) {
            logger.warn('Invalid CNPJ provided');
            throw new CustomError(isValidCnpj.message, isValidCnpj.status);
        }

        const existingEnterpriseWithEmail = await enterpriseRepository.findEnterpriseByEmail(enterpriseData.email);
        if (existingEnterpriseWithEmail) {
            logger.warn(`Enterprise already exists`);
            throw new CustomError("Email already registered", 400);
        }

        const existingEnterpriseWithCnpj = await enterpriseRepository.findEnterpriseByCnpj(enterpriseData.cnpj);
        if (existingEnterpriseWithCnpj) {
            logger.warn(`Enterprise with CNPJ ${enterpriseData.cnpj} already exists`);
            throw new CustomError("CNPJ already registered", 400);
        }

        const companyData = await extractCompanyData(enterpriseData);
        const addressData = await extractAddressData(enterpriseData);

        const newEnterprise = await enterpriseRepository.createEnterprise(companyData, addressData);
        if (!newEnterprise) {
            logger.error("Failed to create enterprise");
                throw new CustomError("Failed to create enterprise", 500);
            }

        return { message: "Successfully created company", enterpriseName: newEnterprise.popularName };
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

        return enterprise;
    }

    async inviteLegalRepresentative(companyId: string, email: string, userId: string) {
        logger.info(`Inviting legal representative from company`);

        if (!email) {
            logger.warn('Email not provided');
            throw new CustomError("Email is required", 400);
        }

        if (!companyId) {
            logger.warn('Company ID not provided');
            throw new CustomError("Company ID is required", 400);
        }

        const guest = await userRepository.findUserByEmail(email);
        if (!guest) {
            logger.warn(`User not found in the system`);
            throw new CustomError("User not found in the system", 404);
        }

        const adminUser = await userRepository.findUserById(userId);
        if (email === adminUser?.email) {
            logger.warn(`Cannot invite yourself as a legal representative`);
            throw new CustomError("You cannot invite yourself as a legal representative", 400);
        }
        const company = await this.findEnterpriseById(companyId);

        await Queue.add('inviteEnterpriseAdminEmail', {
            email: guest.email,
            nameAdmin: adminUser!.name,
            guestName: guest.name,
            enterpriseName: company.popularName,
            inviteLink: await generateInviteToken(guest.userId, companyId, 'adminCompany')
        }, { priority: 4 });

        logger.info(`Invitation email sent to ${email}`);
        return { message: "Invitation email sent successfully", status: 200 };
    }

    async acceptInvite(userId: string, enterpriseId: string, role: string) {
        logger.info(`Adding legal representative to enterprise`);

        if (!userId || !enterpriseId || !role) {
            logger.warn('User ID or Enterprise ID or role not provided');
            throw new CustomError("User ID and Enterprise ID and role are required", 400);
        }

        const userRole = await userRepository.findUserRole(userId)
        if (!userRole) {
            logger.warn(`User with ID ${userId} does not have a role`);
            throw new CustomError("User does not have a role", 400);
        }

        const roleId = await enterpriseRepository.findRoleByName(role);
        if (!roleId) {
            logger.warn(`Role ${role} not found`);
            throw new CustomError("Role not found", 404);
        }

        const existingEnterprise = await enterpriseRepository.findEnterpriseById(enterpriseId);
        if (!existingEnterprise) {
            logger.warn(`Enterprise with ID ${enterpriseId} not found`);
            throw new CustomError("Enterprise not found", 404);
        }

        const existingRepresentative = await enterpriseRepository.existingRepresentative(userId, enterpriseId);
        if (existingRepresentative) {
            logger.warn(`User with ID ${userId} is already a legal representative of enterprise ${enterpriseId}`);
            throw new CustomError("User is already a legal representative of this enterprise", 400);
        }

        const addLegalRepresentative = await enterpriseRepository.addLegalRepresentative(userId, enterpriseId);
        if (!addLegalRepresentative) {
            logger.error("Failed to add legal representative");
            throw new CustomError("Failed to add legal representative", 500);
        }

        const updatedUserRole = await userRepository.updateRoleUser(userId, roleId.id, userRole.roleId);
        if (!updatedUserRole) {
            logger.error("Failed to update user role");
            throw new CustomError("Failed to update user role", 500);
        }

        return { message: "Legal representative added successfully", representative: addLegalRepresentative };
    }

    async requestCompanyRegistration(enterpriseData: EnterpriseDTOSWithAddress, userId: string) {
        logger.info("Starting enterprise registration process");

        const isValidCnpj = await validationCnpj(enterpriseData.cnpj);
        if (isValidCnpj.status !== 200) {
            logger.warn('Invalid CNPJ provided');
            throw new CustomError(isValidCnpj.message, isValidCnpj.status);
        }

        const existingEnterpriseWithEmail = await enterpriseRepository.findEnterpriseByEmail(enterpriseData.email);
        if (existingEnterpriseWithEmail) {
            logger.warn(`Enterprise already exists`);
            throw new CustomError("Email already registered", 400);
        }

        const existingEnterpriseWithCnpj = await enterpriseRepository.findEnterpriseByCnpj(enterpriseData.cnpj);
        if (existingEnterpriseWithCnpj) {
            logger.warn(`Enterprise with CNPJ ${enterpriseData.cnpj} already exists`);
            throw new CustomError("CNPJ already registered", 400);
        }

        const requestCompanyRegistration = await getData('company', enterpriseData.cnpj);
        if (requestCompanyRegistration) {
            logger.error("A request to create this company has already been registered");
            throw new CustomError("A request to create this company has already been registered", 500);
        }

        const requiredAt = new Date().toLocaleString('pt-BR');
        const newCompanyRedisData = await dataSave({ prefix: 'company', key: enterpriseData.cnpj, value: {...enterpriseData, requestedBy: userId, requiredAt}, ttl: 2678400 });
        if( !newCompanyRedisData) {
            logger.error("Failed to save company data in Redis");
            throw new CustomError("Failed to save company data", 500);
        }
        
        const company = await getData('company', enterpriseData.cnpj);
        return company;

    }

    async getAllCompanyRequest() {
        logger.info("Retrieving all company requests");

        const keys = await getKeysByPrefix('company');
        if (!keys || keys.length === 0) {
            logger.warn("No company requests found");
            throw new CustomError("No company requests found", 404);
        }

        const companies = await Promise.all(keys.map(async (key) => {
            const companyData = await getData('company', key);
            return { ...companyData, cnpj: key };
        }));
        
        const companiesWithUserData = await Promise.all(
        companies.map(async (company) => {
            const userData = await useServices.getMe(company.requestedBy);
            const { requestedBy, ...companyWithoutUser } = company;
            return { ...companyWithoutUser,
                requestedByUser: { name: userData.name, userId: userData.id, email: userData.email }
            };
        })
    );

        return companiesWithUserData;
    }

    async confirmCompanyCreation(cnpj: string, legalRepresentatives: { idRepresentative: string }[]){
        logger.info(`Confirming company creation for CNPJ: ${cnpj}`);

        const companyDataRedis = await getData('company', cnpj);
        if (!companyDataRedis) {
            logger.warn(`No company data found for CNPJ: ${cnpj}`);
            throw new CustomError("Company data not found", 404);
        }

        const companyData = await extractCompanyData({...companyDataRedis, legalRepresentatives});
        const addressData = await extractAddressData(companyDataRedis);

        const newEnterprise = await enterpriseRepository.createEnterprise(companyData, addressData);
        if (!newEnterprise) {
            logger.error("Failed to create enterprise");
                throw new CustomError("Failed to create enterprise", 500);
        }

        await delData('company', cnpj);
        return newEnterprise;

    }

    async searchEnterpriseMultipleFields(legalName: string) { 
        logger.info(`Searching for enterprise`);

        if (!legalName || legalName.trim() === '') {
            logger.warn('No legal name provided for enterprise search');
            throw new CustomError("Legal name is required", 400);
        }

        const enterprise = await enterpriseRepository.searchEnterpriseMultipleFields(legalName);
        if (!enterprise) {
            logger.warn(`Enterprise with legal name ${legalName} not found`);
            throw new CustomError("Enterprise not found", 404);
        }

        return enterprise;
    }

}


export default new EnterpriseServices();
