import { AuthRequest } from '@app/middlewares/global_middleware'
import { Request, Response } from 'express';
import {createUserZode, emailZode} from '@app/models/User_models'
import UserService from '@app/services/user_services';

class userController {

    async sendCodeToEmail(req: AuthRequest, res: Response) {
        const { email } = req.body;
        
        const result = emailZode.safeParse(email);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }
        try {
            const response = await UserService.sendCodeToEmail(email);

            res.cookie('email', response.email, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });

            return res.status(200).json(response);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async validEmail(req: AuthRequest, res: Response) {
        const { email } = req.cookies;
        if (!email) {
            return res.status(500).json({ message: "Email not found in cookies" });
        }
        
        try {
            const result = await UserService.validEmail(email, req.body);
            return res.status(200).json(result.message);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async createUser(req: Request, res: Response) {
        const result = createUserZode.safeParse(req.body);
        const email = req.cookies.email;
        if (!email) {
            return res.status(500).json({ message: "Email not found in cookies" });
        }

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return res.status(400).json({
                message: "Validation failed",
                errors: errors
            });
        }
        try {
            const user = await UserService.createUser({
                ...result.data,
                isEmailVerified: true,
                email: email
            }, req.body.confirmPassword);

            res.clearCookie("email", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });

            res.cookie("token", user.token, {
                httpOnly: true,
                maxAge: 6 * 60 * 60 * 1000, // 6 horas
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });

            return res.status(201).send(user);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async login(req: Request, res: Response) {
        const { email } = req.body;
        const result = emailZode.safeParse(email);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }
        try {
            const user = await UserService.login(email, req.body.password);
            res.cookie("token", user.token, {
                httpOnly: true,
                maxAge: 6 * 60 * 60 * 1000, // 6 horas
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            })

            res.status(200).json({
                message: "Login successful",
                userName: user.userName,
            });
        }catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async logout(req: Request, res: Response) {
        res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
        res.clearCookie("email", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
        return res.status(200).json({ message: "Logout successful" });
    }

    async getMe(req: AuthRequest, res: Response) {
        
        const userId = req.userId; 

        try {
            if (!userId) {
                return res.status(400).json({ message: "User ID not found in cookies" });
            }
            const user = await UserService.getMe(userId);
            return res.status(200).json(user);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }


}

export default new userController();