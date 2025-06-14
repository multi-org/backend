import { PrismaClient } from '@app/generated/prisma'

const prisma = new PrismaClient();

export const connectDatabase = async () => {
    try {
        console.log('\nConnecting to the database...');
        await prisma.$connect();
        console.log('Database connection established successfully.\n');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
};

export default prisma;