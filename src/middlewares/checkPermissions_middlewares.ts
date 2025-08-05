import {permissions, hasPermission, RoleName, isValidRoleName, Permission} from './permission'
import { logger, CustomError } from '@app/utils/logger.js';
import { Response, NextFunction } from 'express';
import { AuthRequest } from './global_middleware.js'
import userRepository from '@app/repositories/user_repository'

export const checkPermission = (requiredPermission: Permission) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId!;
            const user = await userRepository.findUserById(userId);

            if (!user) {
                logger.error(`Authenticated user not found in database: ${userId}`);
                throw new CustomError('User session invalid', 401);
            }

            await validatePermissionFormat(requiredPermission);

            const isSystemAllowed = user.userSystemRoles?.some((roleObj) => isValidRoleName(roleObj.role) && hasPermission(roleObj.role as RoleName, requiredPermission));

            if (!isSystemAllowed) {
                logger.warn(`User does not have system permission: ${requiredPermission}`);
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

export const checkCompanyPermission = (requiredPermission: Permission) => { 
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId!;
            const { companyId } = req.params;

            if (!companyId) {
                logger.warn('Company ID not provided');
                throw new CustomError('Company ID not provided', 400);
            }

            await validatePermissionFormat(requiredPermission);

            const user = await userRepository.findUserById(userId);

            if (!user) {
                logger.error(`Authenticated user not found in database: ${userId}`);
                throw new CustomError('User session invalid', 401);
            }

            // verifica se o usuário é admin do sistema
            const isSystemAdmin = user?.userSystemRoles.some((rl) => [ 'adminSystemUser', 'adminCompany'].includes(rl.role));
            if (isSystemAdmin && hasPermission('adminSystemUser', requiredPermission)) {
                logger.info(`RBAC: System admin autorizado para ${requiredPermission}.`);
                return next();
            }

            // verifica se o usário tem permissao na emppresa
            const isCompanyAllowed = user.UserCompanyRole?.some((roleObj) =>
                roleObj.companyId === companyId && 
                isValidRoleName(roleObj.role) &&
                hasPermission(roleObj.role, requiredPermission)
            );

            if (!isCompanyAllowed) {
                logger.warn(`Access denied for company: ${requiredPermission}`);
                throw new CustomError(`Access denied for company: ${requiredPermission}`, 403);
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
    } 
}

async function validatePermissionFormat(permission: string) {
  const [action, resource] = permission.split(':');
  if (!action || !resource) {
    throw new CustomError('Invalid permission format. Expected format: action:resource', 400);
  }
  return { action, resource };
}
