import { logger } from './logger';

export const generateRandomCode = async () => {
    logger.info('Generating random code');
    const ramdomCode = Math.floor(100000 + Math.random() * 900000).toString();
    return ramdomCode; 

}