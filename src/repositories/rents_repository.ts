import { PrismaClient, Rent, Payment, RentStatus } from '@prisma/client';

const prisma = new PrismaClient();

class Rents {
    async findRentsById(productId: string, startDate: Date, endDate: Date) {
        return await prisma.rent.findMany({
            where: {
                productId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                OR: [
                    { startDate: { lte: startDate }, endDate: { gt: startDate } },
                    { startDate: { lt: endDate }, endDate: { gte: endDate } },
                    { startDate: { gte: startDate }, endDate: { lte: endDate } },
                ]
            },
            select: { id: true, startDate: true, endDate: true, status: true }
        });
    }

    async countRentsProduct(productId: string, startDate: Date, endDate: Date) {
        return await prisma.rent.count({
            where: {
                productId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                OR: [
                    {
                        startDate: { lte: endDate },
                        endDate: { gte: startDate }
                    }
                ]
            }
        });
    }

    async createRental(data: any) {
        
        return await prisma.rent.create({
            data, 
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        category: true,
                        imagesUrls: true,
                        description: true,
                        dailyPrice: true,
                        hourlyPrice: true,
                        chargingModel: true,
                        spaceProduct: {
                            select: {
                                capacity: true,
                                area: true,
                            }
                        },
                        equipamentProduct: {
                            select: {
                                brand: true,
                                model: true,
                                specifications: true,
                                stock: true,
                            }
                        },
                        servicesProduct: {
                            select: {
                                durationMinutes: true,
                                requirements: true,
                            }
                        },
                        discountPercentage: true,
                        
                    }
                },
                user: {
                    select: {
                        userId: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    }
                }
            }
        })
    }

    async findRentalsByUserId(userId: string) {

        const rentals = await prisma.rent.findMany({
            where: {userId},
            include: {
                product: true,
                payment: true

            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return rentals;
    }     
    
    async findRentalById(rentId: string) {
        return await prisma.rent.findUnique({
            where: { id: rentId },
        });
    }

    async updateRentalStatus(rentId: string, status: RentStatus) {
        return await prisma.rent.update({
            where: { id: rentId },
            data: { status },
        });
    }
    
}

export default new Rents();