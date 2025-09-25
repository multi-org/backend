import {chargingModel, RentalCreateInput, rentStatus} from '@app/models/Rental_models'
import RentsRepository from '../repositories/rents_repository';
import productRepository from '@app/repositories/products_repository';
import productServices from './products_services';
import { logger, CustomError } from "@app/utils/logger";
import userRepository from '@app/repositories/user_repository';
import Queue from "@app/jobs/lib/queue";


class RentalService {

    async createRentalRequest(userId: string, rentalData: RentalCreateInput) { 
        logger.info(`Creating rental request for userId: ${userId}`);

        const company = await productRepository.findProductCompany(rentalData.productId);
        if (!company.id) {
            logger.error(`Product not found for productId: ${rentalData.productId}`);
            throw new CustomError("Produto não encontrado", 404);
        }

        const availability = await this.checkProductAvailabilityForDays(rentalData.productId, rentalData.selectedDates.map(date => new Date(date)));
        if (!availability.available) {
            logger.error(`Rental request failed: ${availability.reason || 'Produto não disponível'}`);
            throw new CustomError(availability.reason || 'Produto não disponível', 400);
        }

        const calculation = await this.calculateRentalPrice(
            rentalData.productId,
            rentalData.selectedDates.map(date => new Date(date)),
            rentalData.chargingType as chargingModel,
            userId
        );

        const rental = await RentsRepository.createRental({
            userId: userId,
            productId: rentalData.productId,
            description: rentalData.description,
            activityTitle: rentalData.activityTitle,
            activityDescription: rentalData.activityDescription,
            discountApplied: calculation.discountAmount,
            chargingType: rentalData.chargingType,
            totalAmount: calculation.totalAmount,
            status: 'PENDING',
            rentalDates: {
                create: rentalData.selectedDates.map((date: string) => ({
                    date: new Date(date)
                }))
            }
        });

        return {
            id: rental.id,
            status: rental.status,
            dates: rental.rentalDates.map(d => d.date), // 🔑 agora vem daqui
            description: rental.description,
            activityTitle: rental.activityTitle,
            activityDescription: rental.activityDescription,
            pricing: {
                baseAmount: calculation.baseAmount,
                discountAmount: calculation.discountAmount,
                chargingType: calculation.chargingType,
                period: calculation.period,
                pricePerUnit: calculation.pricePerUnit,
                totalAmount: calculation.totalAmount
            },
            product: {
                productId: rental.product.id,
                productTitle: rental.product.title,
                productType: rental.product.type,
                productCategory: rental.product.category,
                productImage: rental.product.imagesUrls,
                productDiscount: rental.product.discountPercentage,
                spaceProduct: rental.product.spaceProduct ?? undefined,
                equipmentProduct: rental.product.equipamentProduct ?? undefined,
                serviceProduct: rental.product.servicesProduct ?? undefined,
            },
            companyThatOwnsProduct: {
                id: company.id,
                name: company.popularName,
                email: company.email,
                associateDiscountRate: company.associateDiscountRate
            },
            client: {
                userId: rental.user.userId,
                name: rental.user.name,
                email: rental.user.email,
                phone: rental.user.phoneNumber
            }
        };
    }

    async getUserRentals(userId: string)
    {
        logger.info(`Fetching rentals for userId: ${userId}`);

        const rentals = await RentsRepository.findRentalsByUserId(userId);
        if (!rentals) {
            logger.error(`No rentals found for userId: ${userId}`);
            throw new CustomError("Nenhum aluguel encontrado", 404);
        }

        logger.info(`Found ${rentals.length} rentals for userId: ${userId}`);

        return {
            rentals: await Promise.all(rentals.map(async rental => {
                const company = await productRepository.findProductCompany(rental.productId);

                return {
                    id: rental.id,
                    dates: rental.rentalDates.map(d => d.date),
                    
                    description: rental.description,
                    activityTitle: rental.activityTitle,
                    activityDescription: rental.activityDescription,
                    pricing: {
                        baseAmount: rental.payment?.amount || 0,
                        discountAmount: rental.discountApplied,
                        chargingType: rental.chargingType,
                        totalAmount: rental.totalAmount
                    },
                    status: rental.status,
                    product: {
                        productId: rental.product.id,
                        productTitle: rental.product.title,
                        productType: rental.product.type,
                        productCategory: rental.product.category,
                        productImage: rental.product.imagesUrls,
                        productDiscount: rental.product.discountPercentage,
                    },
                    companyThatOwnsProduct: {
                        id: company.id,
                        name: company.popularName,
                        email: company.email,
                        associateDiscountRate: company.associateDiscountRate
                    },
                }
            }))
                
        };

    }

    async confirmRental(rentalId: string, response: rentStatus) { 
        logger.info(`Confirming rental with rentalId: ${rentalId}`);

        const rental = await RentsRepository.findRentalById(rentalId);
        if (!rental) {
            logger.error(`Rental not found for rentalId: ${rentalId}`);
            throw new CustomError("Aluguel não encontrado", 404);
        }

        const user = await userRepository.findUserById(rental.userId);
        if (!user) {
            logger.error(`User not found for userId: ${rental.userId}`);
            throw new CustomError("Usuário não encontrado", 404);
        }

        const product = await productRepository.findProductById(rental.productId);
        if (!product) {
            logger.error(`Product not found for productId: ${rental.productId}`);
            throw new CustomError("Produto não encontrado", 404);
        }

        if (rental.status !== 'PENDING') {
            logger.error(`Rental with rentalId: ${rentalId} is not in a confirmable state`);
            throw new CustomError("Aluguel não está em um estado que pode ser confirmado", 400);
        }

        const updatedRental = await RentsRepository.updateRentalStatus(rentalId, response);
        logger.info(`Rental with rentalId: ${rentalId} confirmed successfully`);

        await Queue.add('confirmableRental', {
            email: user.email,
            rentalName: rental.activityTitle,
            productTitle: product.title,
            dates: rental.rentalDates.map(d => d.date),
            response: updatedRental.status,
            userName: user.name
        }, { priority: 1 });

        return {
            id: updatedRental.id,
            status: updatedRental.status,
        };
    }
    
    async checkProductAvailabilityForDays(productId: string, dates: Date[]) {
        logger.info("Checking availability for specific days");

        for (const date of dates) {
            const conflicting = await RentsRepository.findRentsById(productId, date);
            if (conflicting.length > 0) {
                logger.info("Product not available due to conflicting rentals");
                return {
                    available: false,
                    reason: 'Produto já está reservado para este período',
                    conflictingRentals: conflicting.map(rental => ({
                        id: rental.rent.id,
                        status: rental.rent.status
                    }))
                };
            }

            const specificAvailability = await productRepository.specificAvailability(productId, date, date);
            if (specificAvailability) {
                logger.info("Product not available due to specific availability settings");
                return {
                    available: false,
                    reason: 'Produto bloqueado para este período'
                };
            }

            const weeklyAvailabilityCheck = await this.checkWeeklyAvailability(productId, date, date);
            if (!weeklyAvailabilityCheck.available) {
                return {
                    available: false,
                    reason: `Produto não disponível em ${date.toISOString().split("T")[0]}`
                };
            }
        }

        return { available: true };
    }

    async calculateRentalPrice(productId: string, dates: Date[], chargingType: chargingModel, userId: string) {
        logger.info(`Calculating rental price for productId: ${productId}, selectedDates: ${dates}, chargingType: ${chargingType}, userId: ${userId}`);

        const product = await productServices.findProductById(productId);
        if (product.chargingModel !== chargingModel.AMBOS && product.chargingModel !== chargingType) {
            logger.error(`Invalid charging model for this product`);
            throw new CustomError("Invalid charging model for this product", 400);
        }

        let baseAmount = 0;
        let pricePerUnit = 0;

        if (chargingType === chargingModel.POR_DIA) {
            if (!product.dailyPrice) {
                logger.error(`Daily price not set for productId: ${productId}`);
                throw new CustomError("Daily price not set for this product", 400);
            }

            pricePerUnit = Number(product.dailyPrice);
            baseAmount = dates.length * pricePerUnit;

        } else if (chargingType === chargingModel.POR_HORA) {
            if (!product.hourlyPrice) {
                logger.error(`Hourly price not set for productId: ${productId}`);
                throw new CustomError("Hourly price not set for this product", 400);
            }

            pricePerUnit = Number(product.hourlyPrice);
            baseAmount = dates.length * pricePerUnit;
        }

        let discountAmount = 0;
        let totalAmount = baseAmount;

        const associate = await userRepository.findUserAssociateToCompany(userId, product.ownerId);
        if (associate) {
            discountAmount = baseAmount * (Number(product.discountPercentage) / 100);
            totalAmount = baseAmount - discountAmount; 
        }

        logger.info(`Price calculation: baseAmount=${baseAmount}, discountAmount=${discountAmount}, totalAmount=${totalAmount}`);

        return {
            baseAmount,
            discountAmount,
            chargingType,
            period: { days: dates.length },
            pricePerUnit,
            totalAmount
        };
    }

    private async checkWeeklyAvailability(productId: string, startDate: Date, endDate: Date) {
        logger.info("Checking WeeklyAvailability");

        const weeklyAvailabilities = await productRepository.findProductWeeklyAvailability(productId);

        if (weeklyAvailabilities.length === 0) {
            return { available: true }; 
        }

        // Verificar cada dia do período
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            const availability = weeklyAvailabilities.find(wa => wa.dayOfWeek === dayOfWeek);

            if (!availability || !availability.isAvailable) {
                return {
                    available: false,
                    reason: `Produto não disponível às ${this.getDayName(dayOfWeek)}`
                };
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return { available: true };
    }
    
    private getDayName(dayOfWeek: number): string {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return days[dayOfWeek];
  }

}


export default new RentalService();