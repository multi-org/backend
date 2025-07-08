import { logger } from './logger';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import {EnterpriseDTOSWithAddress, createEnterpriseDTOS, companyAddress} from '@app/models/Enterprise_models'

export const generateRandomCode = async () => {
    logger.info('Generating random code');
    const ramdomCode = Math.floor(100000 + Math.random() * 900000).toString();
    return ramdomCode; 

}

interface validationResult {
    message: string;
    status: number;
}

export const validationCpf = async (cpfValue: string): Promise<validationResult> => {
    logger.info('Validating CPF');

    if (!cpf.isValid(cpfValue)) {
        logger.error('Invalid CPF');
        return {message: 'Invalid CPF', status: 400};
    }
    return {message: 'Valid CPF', status: 200};
}

export const validationCnpj = async (cnpValue: string): Promise<validationResult> => {
    logger.info('Validating CNPJ');
    if (!cnpj.isValid(cnpValue)) {
        logger.error('Invalid CNPJ');
        return {message: 'Invalid CNPJ', status: 400};
    }
    return {message: 'Valid CNPJ', status: 200};
}

export const convertDateToUser = async (birthDate: string) => {
    let date: string[] = birthDate.split("-");
    return `${date[2]}/${date[1]}/${date[0]}`;
}

export const convertDateToDatabase = async (birthDate: string) => {
    let date: string[] = birthDate.split("/");
    return `${date[2]}-${date[1]}-${date[0]}`;
}

export const verifyBirthDate = async (birth: string) => {
    const today = new Date();
    const birthDate = new Date(birth);
    
    if (birthDate > today) {
        logger.error('Birth date cannot be in the future');
        return {message: 'Birth date cannot be in the future', status: 400};
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 18) {
        logger.error('User must be at least 18 years old');
        return {message: 'User must be at least 18 years old', status: 400};
    }
    
    return {message: 'Valid birth date', status: 200};
    
}

export async function extractCompanyData(enterpriseData: EnterpriseDTOSWithAddress): Promise<createEnterpriseDTOS> {
    const { popularName, email, cnpj, phone, description, legalName, isMicroenterprise, legalRepresentatives } = enterpriseData;

    return {
        popularName: popularName.trim(),
        email: email.toLowerCase().trim(),
        cnpj: cnpj.trim(),
        phone: phone.trim(),
        description: description?.trim(),
        legalName: legalName?.trim(),
        isMicroenterprise,
        legalRepresentatives: legalRepresentatives
    };
}

export async function extractAddressData(enterpriseData: EnterpriseDTOSWithAddress): Promise<companyAddress> {
    const { street, number, complement, neighborhood, city, state, zipCode, country } = enterpriseData;

    return {
        street: street.trim(),
        number: number.trim(),
        complement: complement?.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country.trim()
    };
}