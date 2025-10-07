import { Response } from 'express';
import { AuthRequest } from '../middlewares/global_middleware';
import rentalServices  from "@app/services/rental_services";
import { validateRentalCreation, RentalCreateInput, validateRentalStatusUpdate} from '@app/models/Rental_models';

export class RentalController {
  
  async createRentalRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!; 
      const { productId } = req.params;

        const validation = validateRentalCreation({...req.body, productId});
        if (!validation.success) {
          return res.status(400).json({
            error: 'Dados inválidos',
            details: validation.error.errors
          });
        }

        const rentalData: RentalCreateInput = validation.data;
        const rental = await rentalServices.createRentalRequest(userId, rentalData);

      res.status(201).json({ success: true, data: rental });
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Erro interno do servidor",
      });
    }
  }

  async getUserRentals(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      
      const result = await rentalServices.getUserRentals(userId);

      res.json({
        success: true,
        rentals: result.rentals
      });
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Erro interno do servidor",
      });
    }
  }

  async confirmRental(req: AuthRequest, res: Response) {
    try {
      const { rentalId } = req.params;
      const { response, reason } = req.body;

      const validation = validateRentalStatusUpdate({ status: response, reason });
      if (!validation.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: validation.error.errors
        });
      }
      
      const updatedRental = await rentalServices.confirmRental(rentalId, response);
      res.json({
        success: true,
        data: updatedRental
      });

    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Erro interno do servidor",
      });
    }
  }

  async getRentalById(req: AuthRequest, res: Response) {
    try {
      const { rentalId } = req.params;

      if (!rentalId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const rental = await rentalServices.getRentalById(rentalId);
      res.json({ success: true, data: rental });
    } catch (error) {
      console.error('Erro ao obter aluguel:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  async getAllRentals(req: AuthRequest, res: Response) {
    try {
      const rentals = await rentalServices.getAllRentals();

      res.json({
        success: true,
        rentals
      });
      
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Erro interno do servidor",
      });
    }
  }
}

export default new RentalController();

