import { Response } from 'express';
import { AuthRequest } from '../middlewares/global_middleware';

import rentalServices  from "@app/services/rental_services";
import { validateRentalCreation, validatePaymentConfirmation, RentalCreateInput, PaymentConfirmation, RentStatus, chargingModel} from '../models/Rental_models';

export class RentalController {
  
  async createRentalRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!; 
      const { productIdParams } = req.params;


      // Normalizar as datas antes da validação
      const normalizedBody = {
        ...req.body,
        productId: productIdParams,
        startDate: new Date(req.body.startDate).toISOString(),
        endDate: new Date(req.body.endDate).toISOString()
      };

      const validation = validateRentalCreation(normalizedBody);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: validation.error.errors
        });
      }

      const rentalData: RentalCreateInput = validation.data;
      const rental = await rentalServices.createRentalRequest(userId, rentalData);

      res.status(201).json({
        success: true,
        data: {
          rental: {
            id: rental.id,
            userId: rental.userId,
            productId: rental.productId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            totalAmount: rental.totalAmount,
            discountApplied: rental.discountApplied,
            status: rental.status,
            description: rental.description,
            activityTitle: rental.activityTitle,
            activityDescription: rental.activityDescription,
            chargingType: rental.chargingType,
            createdAt: rental.createdAt,
            updatedAt: rental.updatedAt,
            product: rental.product,
            user: rental.user
          }
        }
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
  //  * Verifica disponibilidade do produto
  //  * GET /rentals/check-availability
  //  */
  // async checkAvailability(req: AuthRequest, res: Response) {
  //   try {
  //     const { productId, startDate, endDate } = req.query;

  //     if (!productId || !startDate || !endDate) {
  //       return res.status(400).json({
  //         error: 'Parâmetros obrigatórios: productId, startDate, endDate'
  //       });
  //     }

  //     const availability = await rentalService.checkProductAvailability(
  //       productId as string,
  //       new Date(startDate as string),
  //       new Date(endDate as string)
  //     );

  //     res.json({
  //       success: true,
  //       data: availability
  //     });
  //   } catch (error) {
  //     console.error('Erro ao verificar disponibilidade:', error);
  //     res.status(500).json({
  //       error: 'Erro interno do servidor'
  //     });
  //   }
  // }

  // /**
  //  * Cria solicitação de aluguel
  //  * POST /rentals/request
  //  */
  // async createRentalRequest(req: AuthRequest, res: Response) {
  //   try {
  //     const userId = req.userId;
  //     if (!userId) {
  //       return res.status(401).json({ error: 'Usuário não autenticado' });
  //     }

  //     const validation = validateRentalCreation(req.body);
  //     if (!validation.success) {
  //       return res.status(400).json({
  //         error: 'Dados inválidos',
  //         details: validation.error.errors
  //       });
  //     }

  //     const rentalData: RentalCreateInput = validation.data;
  //     const rental = await rentalService.createRentalRequest(userId, rentalData);

  //     res.status(201).json({
  //       success: true,
  //       data: {
  //         rental: {
  //           id: rental.id,
  //           userId: rental.userId,
  //           productId: rental.productId,
  //           startDate: rental.startDate,
  //           endDate: rental.endDate,
  //           totalAmount: rental.totalAmount,
  //           discountApplied: rental.discountApplied,
  //           status: rental.status,
  //           description: rental.description,
  //           activityTitle: rental.activityTitle,
  //           activityDescription: rental.activityDescription,
  //           chargingType: rental.chargingType,
  //           createdAt: rental.createdAt,
  //           updatedAt: rental.updatedAt,
  //           product: rental.product,
  //           user: rental.user
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Erro ao criar solicitação de aluguel:', error);
  //     res.status(400).json({
  //       error: error instanceof Error ? error.message : 'Erro interno do servidor'
  //     });
  //   }
  // }

  // /**
  //  * Gera código PIX para pagamento
  //  * POST /rentals/:id/generate-pix
  //  */
  // async generatePIX(req: AuthRequest, res: Response) {
  //   try {
  //     const { id: rentalId } = req.params;
  //     const userId = req.userId;

  //     if (!userId) {
  //       return res.status(401).json({ error: 'Usuário não autenticado' });
  //     }

  //     const pixInfo = await rentalService.generatePIXPayment(rentalId);

  //     res.json({
  //       success: true,
  //       data: pixInfo
  //     });
  //   } catch (error) {
  //     console.error('Erro ao gerar PIX:', error);
  //     res.status(400).json({
  //       error: error instanceof Error ? error.message : 'Erro interno do servidor'
  //     });
  //   }
  // }

  // /**
  //  * Confirma pagamento
  //  * POST /rentals/confirm-payment
  //  */
  // async confirmPayment(req: AuthRequest, res: Response) {
  //   try {
  //     const userId = req.userId;
  //     if (!userId) {
  //       return res.status(401).json({ error: 'Usuário não autenticado' });
  //     }

  //     const validation = validatePaymentConfirmation(req.body);
  //     if (!validation.success) {
  //       return res.status(400).json({
  //         error: 'Dados inválidos',
  //         details: validation.error.errors
  //       });
  //     }

  //     const paymentData: PaymentConfirmation = validation.data;
  //     const result = await rentalService.confirmPayment(paymentData);

  //     res.json({
  //       success: true,
  //       data: {
  //         rental: {
  //           id: result.rental.id,
  //           userId: result.rental.userId,
  //           productId: result.rental.productId,
  //           startDate: result.rental.startDate,
  //           endDate: result.rental.endDate,
  //           totalAmount: result.rental.totalAmount,
  //           discountApplied: result.rental.discountApplied,
  //           status: result.rental.status,
  //           description: result.rental.description,
  //           activityTitle: result.rental.activityTitle,
  //           activityDescription: result.rental.activityDescription,
  //           chargingType: result.rental.chargingType,
  //           createdAt: result.rental.createdAt,
  //           updatedAt: result.rental.updatedAt,
  //           product: result.rental.product,
  //           user: result.rental.user
  //         },
  //         payment: {
  //           id: result.payment.id,
  //           status: result.payment.status,
  //           method: result.payment.method,
  //           amount: result.payment.amount,
  //           transactionId: result.payment.transactionId,
  //           paidAt: result.payment.paidAt
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Erro ao confirmar pagamento:', error);
  //     res.status(400).json({
  //       error: error instanceof Error ? error.message : 'Erro interno do servidor'
  //     });
  //   }
  // }

  // /**
  //  * Lista aluguéis do usuário
  //  * GET /rentals/my-rentals
  //  */
  // async getUserRentals(req: AuthRequest, res: Response) {
  //   try {
  //     const userId = req.userId;
  //     if (!userId) {
  //       return res.status(401).json({ error: 'Usuário não autenticado' });
  //     }

  //     const { status } = req.query;
  //     const rentals = await rentalService.getUserRentals(
  //       userId, 
  //       status as RentStatus | undefined
  //     );

  //     res.json({
  //       success: true,
  //       data: rentals.map(rental => ({
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
  //       }))
  //     });
  //   } catch (error) {
  //     console.error('Erro ao listar aluguéis:', error);
  //     res.status(500).json({
  //       error: 'Erro interno do servidor'
  //     });
  //   }
  // }

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

