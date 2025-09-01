import { Response } from 'express';
import { AuthRequest } from '@app/middlewares/global_middleware'
import AvailabilityService from '@app/services/availability_services';
import { AvailabilityOptions } from '@app/models/availability_models';


class AvailabilityController {

  async getAvailableDates(req: AuthRequest, res: Response): Promise<Response> {
    
    try {
      const { productId } = req.params;
      const { startDate, endDate, includeHours } = req.query;

      const options: AvailabilityOptions = {
        startDate: startDate as string,
        endDate: endDate as string,
        includeHours: includeHours === 'true'
      };

      const availableDates = await AvailabilityService.getAvailableDates(productId, options);

      return res.status(200).json({
        success: true,
        data: availableDates,
        message: 'Disponibilidade obtida com sucesso'
      });
      
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        message: error.message || "Internal Server Error",
        error: 'AVAILABILITY_ERROR',
        success: false
      });
    }
  }

  async getAvailableHours(req: AuthRequest, res: Response) {
    try {
      const { productId, date } = req.params;

      const availableHours = await AvailabilityService.getAvailableHours(productId, date);

      return res.status(200).json({
        success: true,
        data: availableHours,
        message: 'Horários disponíveis obtidos com sucesso'
      });
    }catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: 'HOURS_AVAILABILITY_ERROR'
      });
    }
  }
}

export default new AvailabilityController();

