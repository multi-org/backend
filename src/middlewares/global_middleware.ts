import jwt from 'jsonwebtoken';
import { logger, CustomError } from '@app/utils/logger'
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
    cookies: { [key: string]: string }
    userId?: string;
    email?: string;
}

export const generateToken = async (userId: string, email: string) => {
    const secret = process.env.SECRETJWT;
    if (!secret) {
        throw new CustomError('JWT secret não definida nas variáveis de ambiente', 500);
    }
    return jwt.sign(
        { userId: userId, email: email}, secret,
        { expiresIn: 21600 } // 6 horas
    );
};

export const generateInviteToken = async (userId: string, enterpriseId: string, role: string) => {
    const token =  jwt.sign(
        { userId: userId, enterpriseId: enterpriseId, role: role },
        process.env.SECRETJWT!,
        { expiresIn: '3d' } // 3 dias
    );

    return `http://localhost:8083/companies/invite/accept?token=${token}`; // mudar aqui quando tiver a rota do frontend - por enquanto vai chamar a rota do back direto
}

export const jwtRequired = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        logger.warn('Access denied. No token provided.');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRETJWT!) as { userId: string, email: string };
        req.userId = decoded.userId;
        req.email = decoded.email;

        logger.debug('Token is valid. User authenticated:');

        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            logger.warn(`Token JWT inválido recebido: ${error.message}`);

            res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' } );
            return next(new CustomError('Sessão inválida. Por favor, faça login novamente.', 401));
        } 
        
        if (error.name === 'TokenExpiredError') {
            logger.info(`Token JWT expirado para usuário.`);
            
            res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' } );
            return next(new CustomError('Sua sessão expirou. Por favor, faça login novamente.', 401));
        }
            
        logger.error(`Erro inesperado na verificação do JWT: ${error.message}`);
        return next(new CustomError('Erro interno durante a autenticação.', 500));
    }
};