import { Response } from 'express';
import { AuthRequest } from '../middlewares/global_middleware';
import rentalServices  from "@app/services/rental_services";
import { validateRentalCreation, RentalCreateInput, validateRentalCreationByHour, validateRentalStatusUpdate, RentalCreateHourInput} from '@app/models/Rental_models';

export class RentalController {
  
  async createRentalRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!; 
      const { productId } = req.params;
      let rental;

      if (req.body.chargingType === "POR_DIA") {
        // Normalizar as datas antes da validação
        const normalizedBody = {
          ...req.body,
          productId,
          selectedDates: req.body.selectedDates.map((date: string) => new Date(date).toISOString())
        };

        const validation = validateRentalCreation(normalizedBody);
        if (!validation.success) {
          return res.status(400).json({
            error: 'Dados inválidos',
            details: validation.error.errors
          });
        }

        const rentalData: RentalCreateInput = validation.data;
        rental = await rentalServices.createRentalRequestByDay(userId, rentalData);
      }

      else if (req.body.chargingType === "POR_HORA") {         
        const validation = validateRentalCreationByHour({...req.body, productId});
        if (!validation.success) {
          return res.status(400).json({
            error: 'Dados inválidos',
            details: validation.error.errors
          });
        }

        const rentalData: RentalCreateHourInput = validation.data;
        rental = await rentalServices.createRentalRequestByHour(userId, rentalData);
      }

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

  // /**
  //  * Obtém detalhes de um aluguel específico
  //  * GET /rentals/:id
  //  */
  // async getRentalById(req: AuthRequest, res: Response) {
  //   try {
  //     const { id: rentalId } = req.params;
  //     const userId = req.userId;

  //     if (!userId) {
  //       return res.status(401).json({ error: 'Usuário não autenticado' });
  //     }

  //     const rentals = await rentalService.getUserRentals(userId);
  //     const rental = rentals.find(r => r.id === rentalId);

  //     if (!rental) {
  //       return res.status(404).json({ error: 'Aluguel não encontrado' });
  //     }

  //     res.json({
  //       success: true,
  //       data: {
  //         id: rental.id,
  //         userId: rental.userId,
  //         productId: rental.productId,
  //         startDate: rental.startDate,
  //         endDate: rental.endDate,
  //         totalAmount: rental.totalAmount,
  //         discountApplied: rental.discountApplied,
  //         status: rental.status,
  //         description: rental.description,
  //         activityTitle: rental.activityTitle,
  //         activityDescription: rental.activityDescription,
  //         chargingType: rental.chargingType,
  //         createdAt: rental.createdAt,
  //         updatedAt: rental.updatedAt,
  //         product: rental.product,
  //         payment: rental.payment
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Erro ao obter aluguel:', error);
  //     res.status(500).json({
  //       error: 'Erro interno do servidor'
  //     });
  //   }
  // }

  // /**
  //  * Cancela um aluguel
  //  * POST /rentals/:id/cancel
  //  */
  // async cancelRental(req: AuthRequest, res: Response) {
  //   try {
  //     const { id: rentalId } = req.params;
  //     const { reason } = req.body;
  //     const userId = req.userId;

  //     if (!userId) {
  //       return res.status(401).json({ error: 'Usuário não autenticado' });
  //     }

  //     const rental = await rentalService.cancelRental(rentalId, userId, reason);

  //     res.json({
  //       success: true,
  //       data: {
  //         id: rental.id,
  //         userId: rental.userId,
  //         productId: rental.productId,
  //         startDate: rental.startDate,
  //         endDate: rental.endDate,
  //         totalAmount: rental.totalAmount,
  //         discountApplied: rental.discountApplied,
  //         status: rental.status,
  //         description: rental.description,
  //         activityTitle: rental.activityTitle,
  //         activityDescription: rental.activityDescription,
  //         chargingType: rental.chargingType,
  //         createdAt: rental.createdAt,
  //         updatedAt: rental.updatedAt,
  //         product: rental.product,
  //         user: rental.user
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Erro ao cancelar aluguel:', error);
  //     res.status(400).json({
  //       error: error instanceof Error ? error.message : 'Erro interno do servidor'
  //     });
  //   }
  // }
}

export default new RentalController();

