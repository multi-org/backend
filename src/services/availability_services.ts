import { AvailabilityDate, AvailabilityOptions } from '@app/models/availability_models';
import productRepository from "@app/repositories/products_repository";
import { logger, CustomError } from "@app/utils/logger";
import {productAvailabilityInterface } from '@app/models/Product_models';

class AvailabilityService {

  async getAvailableDates(productId: string, options: AvailabilityOptions = {}): Promise<AvailabilityDate[]> {
    logger.info(`Fetching available dates for product ${productId}`);

    if (!productId || productId.trim() === '') {
      logger.error('Product ID is required');
      throw new CustomError('Product ID is required', 400);
    }
    
    if (options.startDate && options.endDate) {
      const start = new Date(options.startDate);
      const end = new Date(options.endDate);
      
      if (start > end) {
        logger.error('Start date must be before end date');
        throw new CustomError('Start date must be before end date', 400);
      }

      // Limitar o range máximo para evitar consultas muito pesadas
      const maxDays = 90; // 3 meses
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > maxDays) {
        logger.error(`Date range cannot exceed ${maxDays} days`);
        throw new CustomError(`Date range cannot exceed ${maxDays} days`, 400);
      }
    }

    const product = await productRepository.availableDatesProoduct(productId);
    if (!product) {
      logger.error("Product not found", { productId });
      throw new CustomError("Produto não encontrado", 404);
    }

    else if (product.status === 'DELETED') {
      logger.error("Product is deleted", { productId });
      throw new CustomError("Produto foi excluído", 410);
    }

    const availableDates = await this.defineDefaultRangeAvailableDates(options, product as productAvailabilityInterface);

    logger.info(`Available dates found successfully`);
    return availableDates;
  }

  async getAvailableHours(productId: string, date: string) {
    logger.info(`Fetching available hours for product ${productId} on date ${date}`);

    if (!productId || productId.trim() === '') {
      logger.error('Product ID is required');
      throw new CustomError('Product ID is required', 400);
    }

    if (!date || date.trim() === '') {
      logger.error('Date is required');
      throw new CustomError('Date is required', 400);
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      logger.error('Invalid date format. Use YYYY-MM-DD');
      throw new CustomError('Invalid date format. Use YYYY-MM-DD', 400);
    }

    // verificar se a data não é no passado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      logger.error('Cannot check availability for past dates');
      throw new CustomError('Cannot check availability for past dates', 400);
    }

    const weeklyAvailability = await productRepository.getAvailableHours(productId, date);

    if (!weeklyAvailability) {
      logger.error('No weekly availability found');
      throw new CustomError('No weekly availability found', 404);
    }

    const availableHours = this.generateHourRange(weeklyAvailability.startTime, weeklyAvailability.endTime);

    // Verificar aluguéis que ocupam horários específicos nesta data
    const dateString = targetDate.toISOString().split('T')[0];
    const rents = await productRepository.findRentsByDate(productId, dateString);
    if (rents.length > 0) { 
      logger.error("Rents found for the selected date");
      throw new CustomError("Rents found for the selected date", 409);
    }

    logger.info('Available hours fetched successfully');
    return availableHours;
  }

  private async defineDefaultRangeAvailableDates(options: AvailabilityOptions = {}, product: productAvailabilityInterface): Promise<AvailabilityDate[]> {
    logger.info(`Defining default range of available dates`);

    // Definir range de datas (padrão: próximos 30 dias)
    const startDate = options.startDate ? new Date(options.startDate) : new Date();
    const endDate = options.endDate ? new Date(options.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const allDates = this.generateDateRange(startDate, endDate);

    logger.info('Mapping availability for each date');
    const availabilityDates: AvailabilityDate[] = allDates.map(date => {
      
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      logger.info('Checking for Weekly Availability Setting');
      const weeklyAvailability = product.ProductWeeklyAvailability?.find(wa => wa.dayOfWeek === dayOfWeek);
      

      logger.info('Checking for Specific Availability Setting');
      const specificAvailability = product.productAvailability?.find(pa => {
        const paStart = new Date(pa.startDate).toISOString().split('T')[0];
        const paEnd = new Date(pa.endDate).toISOString().split('T')[0];
        return dateString >= paStart && dateString <= paEnd;
      });

      logger.info('Checking for existing rents');
      const isOccupied = product.rents?.some(rent => {
        const rentStart = new Date(rent.startDate).toISOString().split('T')[0];
        const rentEnd = new Date(rent.endDate).toISOString().split('T')[0];
        return dateString >= rentStart && dateString <= rentEnd;
      });

      logger.info('Determine availability');
      let isAvailable = true;
      let reason = '';
      let availableHours: string[] = [];
      let price = product.dailyPrice?.toNumber();

      logger.info("Checking if it is occupied for rent")
      if (isOccupied) {
        isAvailable = false;
        reason = 'Ocupado por aluguel';
      }

      // Se há configuração específica
      else if (specificAvailability) {
        isAvailable = specificAvailability.isAvailable;
        
        if (specificAvailability.priceOverride) {
            price = specificAvailability.priceOverride.toNumber();
        }
        if (!isAvailable) {
            reason = 'Bloqueado pelo proprietário';
        }
      }
          
      // Se há configuração semanal
      else if (weeklyAvailability) {
        isAvailable = weeklyAvailability.isAvailable;
        if (!isAvailable) {
            reason = 'Fora do horário de funcionamento';
        } else if (options.includeHours && product.chargingModel === 'POR_HORA') {
            availableHours = this.generateHourRange(weeklyAvailability.startTime, weeklyAvailability.endTime);
        }
      }
          
      // Se não há configuração, assumir indisponível
      else {
          isAvailable = false;
          reason = 'Horário não configurado';
      }

      const result: AvailabilityDate = {
          date: dateString,
          isAvailability: isAvailable,
          reason: isAvailable ? undefined : reason
      };

      if (isAvailable) {
          if (price) result.price = price;
          if (availableHours.length > 0) result.availableHours = availableHours;
      }

      return result;
    });
    
    return availabilityDates;

  }
  
  private generateDateRange(startDate: Date, endDate: Date): Date[] {
    logger.info('Generating date range');
    
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
  
  private generateHourRange(startTime: string, endTime: string): string[] {
    logger.info('Generating hour range');

    const hours: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        hours.push(timeString);

        currentMinute += 60; // Incrementar de hora em hora
        if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute = currentMinute % 60;
        }
    }
    return hours;
  }

}

export default new AvailabilityService();
