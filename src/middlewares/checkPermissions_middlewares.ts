import userRepository from '../repositories/user_repository.js';
import { logger, CustomError } from '@app/utils/logger.js';
import { Response, NextFunction } from 'express';
import {AuthRequest} from './global_middleware.js'

export const checkPermission = (requiredPermission: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId!;
            const user = await userRepository.findUserById(userId);

            if (!user || !user.userRoles?.length) {
                logger.error('User not found or no roles assigned.');
                throw new CustomError('User not found or no roles assigned.', 404);
            }

            const [requeiredAction, requiredResource] = requiredPermission.split(':');
            if (!requeiredAction || !requiredResource) {
                logger.error('Invalid permission format. Expected format: action:resource');
                throw new CustomError('Invalid permission format. Expected format: action:resource', 400);
            }

            let hasPermission = false;
            for (const userRole of user.userRoles) {
                const role = userRole.role;
                const rolePermissions = role?.rolesPermissions || [];
                
                for (const {permission} of rolePermissions) {
                    if (permission?.action === requeiredAction &&
                        permission?.resource === requiredResource)
                    {
                        hasPermission = true;
                        break;
                    }
                }
                
                if (hasPermission) break;
            }

            if (!hasPermission) {
                logger.warn(`User does not have permission: ${requiredPermission}`);
                throw new CustomError(`Access denied. You do not have permission: ${requiredPermission}`, 403);
            }

            logger.info(`RBAC: Usuário autorizado para ${requiredPermission}.`);
            next();

        } catch (error: any) {
            logger.error(`Error in checkCompanyPermission middleware: ${error.message}`);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                message: error.message
            });
        }
    };
};

export const checkCompanyPermission = (requiredPermission: string) => { 
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId!;
            const { companyId } = req.params;

            if (!companyId) {
                logger.warn('Company ID not provided');
                throw new CustomError('Company ID not provided', 400);
            }

            const [requeiredAction, requiredResource] = requiredPermission.split(':');
            if (!requeiredAction || !requiredResource) {
                logger.error('Invalid permission format. Expected format: action:resource');
                throw new CustomError('Invalid permission format. Expected format: action:resource', 400);
            }

            const user = await userRepository.findUserById(userId);
            if (!user) {
                logger.error('User not found.');
                throw new CustomError('User not found', 404);
            }

            const isSystemAdmin = user.userRoles?.some(r => r.role.name === 'system_admin');
            if (isSystemAdmin) {
                logger.info(`RBAC: System admin autorizado para ${requiredPermission}.`);
                return next();
            }

            const hasCompanyPermission = user.enterpriseUserRoles?.some(er => er.userId === userId && er.role?.rolesPermissions?.some(({permission}) => 
                permission?.action === requeiredAction &&
                permission?.resource === requiredResource
            ));


            if (!hasCompanyPermission) {
                logger.warn(`Access denied for company: ${requiredPermission}`);
                throw new CustomError(`Access denied for company: ${requiredPermission}`, 403);
            }

            logger.info(`RBAC: Usuário autorizado para ${requiredPermission} na empresa ${companyId}.`);
            next();

        } catch (error: any) {
            logger.error(`Error in checkCompanyPermission middleware: ${error.message}`);
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                message: error.message
            });
        }   
    } 
}