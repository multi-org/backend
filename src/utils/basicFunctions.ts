import { cp } from 'fs';
import { logger } from './logger';
import {cnpj, cpf} from 'cpf-cnpj-validator';
import { promises } from 'dns';

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
    return `${date[0]}/${date[1]}/${date[2]}`;
}

export const convertDateToDatabase = async (birthDate: string) => {
    let date: string[] = birthDate.split("/");
    return `${date[2]}-${date[1]}-${date[0]}`;
}