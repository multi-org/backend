import { PrismaClient, Rent, Payment, RentStatus } from '@prisma/client';

const prisma = new PrismaClient();

class Rents {
    async findRentsById(productId: string, date: Date) {
        return await prisma.rentalDate.findMany({
            where: {
                date,
                rent: {
                    productId,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                }
            },
            select: { rent: true }
        });
    }

    async countRentsProduct(productId: string, startDate: Date, endDate: Date) {
        return await prisma.rent.count({
            where: {
                productId,
                status: { in: ['PENDING', 'CONFIRMED'] },
            }
        });
    }

    async createRental(data: any) {
        return await prisma.rent.create({
            data,
            include: {
                rentalDates: true,
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
        });
    }


    async findRentalsByUserId(userId: string) {

        const rentals = await prisma.rent.findMany({
            where: {userId},
            include: {
                product: true,
                payment: true,
                rentalDates: true
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
            select: { id: true, status: true, userId: true, productId: true, activityTitle: true, rentalDates: true }
        });
    }

    async updateRentalStatus(rentId: string, status: RentStatus) {
        return await prisma.rent.update({
            where: { id: rentId },
            data: { status },
            select: { id: true, status: true, userId: true, productId: true, activityTitle: true, rentalDates: true }
        });
    }

    async findRentsByIdAndHour(productId: string, start: Date, end: Date) {
        return await prisma.rentalDate.findMany({
            where: {
                rent: { productId, status: { in: ['PENDING','CONFIRMED'] } },
                OR: [
                    {
                        startTime: { lt: end },
                        endTime: { gt: start }
                    }
                ]
            },
            select: { rent: true }
        });
    }


    
}

export default new Rents();