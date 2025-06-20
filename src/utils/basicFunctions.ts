import { logger } from './logger';

export const generateRandomCode = async () => {
    logger.info('Generating random code');
    const ramdomCode = Math.floor(100000 + Math.random() * 900000).toString();
    return ramdomCode; 

}

interface validationResult {
    message: string;
    status: number;
}

export const validationCpf = async (cpf: string): Promise<validationResult> => {
    logger.info('Validating CPF');

    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11) {
        logger.error('CPF must have 11 digits');
        return{message: "CPF must have 11 digits", status: 400};
        
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
        logger.error('CPF cannot be all the same digit');
        return{message: "CPF cannot be all the same digit", status: 400};
    }

    let sum1: number = 0;
    for (let i = 0; i < 9; i++) {
        sum1 += parseInt(cpf[i]) * (10 - i);
    }

    let digit1 = (sum1 * 10) % 11;
    digit1 = digit1 === 10 ? 0 : digit1;

    let sum2: number = 0;
    for (let i = 0; i < 10; i++) {
        sum2 += parseInt(cpf[i]) * (11 - i);
    }

    let digit2 = (sum2 * 10) % 11;
    digit2 = digit2 === 10 ? 0 : 1;

    if (cpf[9] !== digit1.toString() || cpf[10] !== digit2.toString()) {
        logger.error('Invalid CPF digits');
        return {message:'Invalid CPF digits', status: 400};
    }

    return {message: 'Valid CPF', status: 200};
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