import { logger } from './logger';

export const generateRandomCode = async () => {
    logger.info('Generating random code');
    const ramdomCode = Math.floor(100000 + Math.random() * 900000).toString();
    return ramdomCode; 

}

export const validationCpf = (cpf: string): object => {
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
    return `${date[0]}/${date[1]}/${date[2]}`;
}

export const convertDateToDatabase = async (birthDate: string) => {
    let date: string[] = birthDate.split("/");
    return `${date[2]}-${date[1]}-${date[0]}`;
}