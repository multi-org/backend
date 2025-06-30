import userRepository from '../repositories/user_repository.js';
import { logger, CustomError } from '@app/utils/logger.js';
import { Response, NextFunction } from 'express';
import {AuthRequest} from './global_middleware.js'
import { hasSubscribers } from 'diagnostics_channel';

export const checkPermission = (requiredPermission: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId!;
            const userWithPermission = await userRepository.findUserById(userId);
            if (!userWithPermission || !userWithPermission.userRoles) {
                logger.error('User not found or no roles assigned.');
                return next(new CustomError('User not found or no roles assigned.', 404));
            }

            const [requeiredAction, requiredResource] = requiredPermission.split(':');
            if (!requeiredAction || !requiredResource) {
                logger.error('Invalid permission format. Expected format: action:resource');
                throw new CustomError('Invalid permission format. Expected format: action:resource', 400);
            }

            let hasPermission = false;
            for (const userRole of userWithPermission.userRoles) {
                const role = userRole.role;
                if (role.rolesPermissions) {
                    for (const rolePermission of role.rolesPermissions) {
                        const permission = rolePermission.permission;
                        if (permission.action === requeiredAction && permission.resource === requiredResource) {
                            hasPermission = true;
                            break;
                        }
                    }
                }
                if (hasPermission) break;
            }
            if (!hasPermission) {
                logger.warn(`User does not have permission: ${requiredPermission}`);
                return next(new CustomError(`Access denied. You do not have permission: ${requiredPermission}`, 403));
            }

            logger.info(`RBAC: Usuário autorizado para ${requiredPermission}.`);
            next();
        } catch (error: any) {
            logger.error(`Error in checkCompanyPermission middleware: ${error.message}`);
            return next(new CustomError('Error checking permissions', 500));
        }
    };
};

export const checkCompanyPermission = (requiredPermission: string) => { 
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId!;
            const userWithPermission = await userRepository.findUserById(userId);
            if (!userWithPermission || !userWithPermission.userRoles) {
                logger.error('User not found or no roles assigned.');
                return next(new CustomError('User not found or no roles assigned.', 404));
            }

            const { companyId } = req.query;
            if (!companyId) {
                logger.warn('Event ID not provided.');
                return next(new CustomError('Event ID not provided', 400));
            }

            const [requeiredAction, requiredResource] = requiredPermission.split(':');
            if (!requeiredAction || !requiredResource) {
                logger.error('Invalid permission format. Expected format: action:resource');
                throw new CustomError('Invalid permission format. Expected format: action:resource', 400);
            }

            const userWithDetails = userWithPermission.enterpriseUserRoles.map(lr => lr.id === companyId);
            if (!userWithDetails) {
                logger.error(`User with ID ${userId} not found.`);
                return next(new CustomError('User not found.', 404));
            }

            const isSystemAdmin = userWithPermission.userRoles.some(r => r.role.name === 'SYSTEM_ADMIN');
            if (isSystemAdmin) {
                logger.info(`RBAC: System admin autorizado para ${requiredPermission}.`);
                return next();
            }

            let hasGlobalPermission = false;
            for (const userRole of userWithPermission.userRoles) {
                const role = userRole.role;
                if (role.rolesPermissions) {
                    for (const rolePermission of role.rolesPermissions) {
                        const permission = rolePermission.permission;
                        if (permission.action === requeiredAction && permission.resource === requiredResource) {
                            hasGlobalPermission = true;
                            break;
                        }
                    }
                }
                if (hasGlobalPermission) break;
            }

            if (!hasSubscribers) {
                const companyUserRoles = "" // = await 
            }

        } catch (error: any) {
            logger.error(`Error in checkCompanyPermission middleware: ${error.message}`);
            return next(new CustomError('Error checking permissions', 500));
        }   
    } 
}