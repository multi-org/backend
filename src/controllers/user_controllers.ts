import { AuthRequest } from '@app/middlewares/global_middleware'
import { Request, Response } from 'express';
import {createUserZode, emailZode, UserAdressZode, userCpfZode } from '@app/models/User_models'
import UserService from '@app/services/user_services';
import { dataSave, delData, getData } from '@app/models/redis_models';
import { randomUUID } from 'crypto';
import uploadService from "@app/services/upload_services";
import Queue from "@app/jobs/lib/queue";

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

            const verificationToken = randomUUID();
            await dataSave({ prefix: 'email_verification', key: verificationToken, value: response, ttl: 60 * 60}); 
            res.cookie('verification_token', verificationToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000, // 1 hora
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });

            return res.status(200).json(response.message);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async validEmail(req: AuthRequest, res: Response) {
        const { verification_token } = req.cookies;
        if (!verification_token) {
            return res.status(500).json({ message: "Verification token not found in cookies" });
        }
        
        try {
            const { email } = await getData('email_verification', verification_token);
            if (!email) {
                return res.status(400).json({ message: "Invalid or expired email verification" });
            }

            const result = await UserService.validEmail(email, req.body);

            const userCreationToken = randomUUID();
            await dataSave({ prefix: 'user_creation', key: userCreationToken, value: email, ttl: 60 * 60 });
            await delData('email_verification', verification_token);

            res.cookie('user_creation_token', userCreationToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000, // 1 hora
                secure: process.env.NODE_ENV === 'production',  
                sameSite: 'lax',
                path: '/'
            });

            res.clearCookie("verification_token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
            
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
        const {user_creation_token} = req.cookies;
        if (!user_creation_token) {
            return res.status(500).json({ message: "User creation token not found in cookies" });
        }
        
        const email = await getData('user_creation', user_creation_token);
        if (!email) {
            return res.status(400).json({ message: "Invalid or expired user creation token" });
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

            await delData('user_creation', user_creation_token);

            res.clearCookie("user_creation_token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });

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
                user
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
        res.clearCookie("user_creation_token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
        res.clearCookie("verification_token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
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

    async createAddress(req: AuthRequest, res: Response) {
        const userId = req.userId!;
        const addressData = UserAdressZode.safeParse(req.body);
        if (!addressData.success) {
            return res.status(400).json({
                message: "Invalid address data",
                errors: addressData.error.errors,
            });
        }

        try {
            const address = await UserService.createUserAddress(userId, addressData.data);
            return res.status(201).json(address);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async requestAssociation(req: AuthRequest, res: Response) { 
        
        if (!req.file) {
            return res.status(400).json({ message: "File not found in request" });
        }

        const { companyId } = req.params;
        const typeRequest = req.query.request;
        const userId = req.userId!;
        const { userCpf, position } = req.body;
        const localFilePath = req.file.path;

        try {
            const ValidCpf = userCpfZode.safeParse(userCpf);
            if (!ValidCpf.success) {
                return res.status(400).json({
                    message: "Invalid CPF",
                    errors: ValidCpf.error.errors,
                });
            }

            if (!typeRequest || (typeRequest !== 'associate' && typeRequest !== 'representative')) {
                return res.status(400).json({ message: "Invalid request type. Use 'associate' or 'representative'." });
            }
            
            if (typeRequest === 'representative' && !position) {
                return res.status(400).json({ message: "Position is required for legal representative requests" });
            }

            const association = await UserService.requestAssociationUser(userId, companyId, userCpf, localFilePath, typeRequest, position);
            return res.status(201).json({message: "Association request created successfully", success: association});
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getAllRequests(req: AuthRequest, res: Response) { 
      try {
        const typeRequest = req.query.request;

        if (!typeRequest || (typeRequest !== 'associate' && typeRequest !== 'representative')) {
          return res.status(400).json({ message: "Invalid request type. Use 'associate' or 'representative'." });
        }

        const associations = await UserService.getAllRepresentativeOrAssociateRequests(typeRequest);
        return res.status(200).json(associations);
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async requestsToCompanyConfirmation(req: AuthRequest, res: Response) {
      const { userId } = req.params;
      const typeRequest = req.query.request;
      
      if (!typeRequest || (typeRequest !== 'associate' && typeRequest !== 'representative')) {
        return res.status(400).json({ message: "Invalid request type. Use 'associate' or 'representative'." });
      }
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      try {
        const confirmation = await UserService.requestsToCompanyConfirmation(userId, typeRequest);
        return res.status(200).json(confirmation);
      } catch (error: any) {
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
          message: error.message || "Internal Server Error",
        });
      }
    }

    async requestsToCompanyReject(req: AuthRequest, res: Response) { 
      const { userId, companyId } = req.params;
      const typeRequest = req.query.request;

      if (!userId || !companyId) {
       return res.status(400).json({ message: "User ID and Company ID are required" });
     }
      
      if (!typeRequest || (typeRequest !== 'associate' && typeRequest !== 'representative')) {
        return res.status(400).json({ message: "Invalid request type. Use 'associate' or 'representative'." });
      }

      try {
        const rejection = await UserService.requestsToCompanyReject(userId, companyId, typeRequest);
        return res.status(200).json({success: true, message: rejection});
      } catch (error: any) {
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
          message: error.message || "Internal Server Error",
        });
      }
    }

    async deleteAllRequests(req: AuthRequest, res: Response) { 
      const userId = req.userId!;
      const typeRequest = req.query.request;

      if (!userId) {
        return res.status(400).json({ message: "User ID not found in cookies" });
      }
      
      if (!typeRequest || (typeRequest !== 'associate' && typeRequest !== 'representative')) {
        return res.status(400).json({ message: "Invalid request type. Use 'associate' or 'representative'." });
      }

      const { companyId } = req.params;
      if (!companyId) {
          return res.status(400).json({ message: "Company ID is required" });
      }

      try {
          const result = await UserService.deleteAllRequestsByCompanyId(companyId, typeRequest);
          return res.status(200).json({success: true, message: `Successfully deleted ${result} association requests for the company`});
      } catch (error: any) {
          const statusCode = error.status || 500;
          return res.status(statusCode).json({
              message: error.message || "Internal Server Error",
          });
      }
    }

    async confirmPassword(req: AuthRequest, res: Response) {
        try {
            const emailUser = req.email!;
            const { password } = req.body;

            if(!password) {
                return res.status(400).json({ message: "Password is required" });
            }

            const isPasswordConfirmed = await UserService.ConfirmPassword(emailUser, password);
            if (!isPasswordConfirmed.success) {
                return res.status(401).json({ message: "Password confirmation failed" });
            }

            const passwordToken = randomUUID();
            res.cookie('password_confirmation_token', passwordToken, {
                httpOnly: true,
                maxAge: 5 * 60 * 1000, // 5 minutes
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            })

            return res.status(200).json({ message: "Password confirmed successfully", isPasswordConfirmed });
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async changePasswordController(req: AuthRequest, res: Response) { 
        try {
            const emailUser = req.email!;
            const { newPassword, passwordConfirmation } = req.body;

            if(!newPassword || !passwordConfirmation) {
                return res.status(400).json({ message: "New password and password confirmation are required" });
            }

            const { password_confirmation_token } = req.cookies;
            if (!password_confirmation_token) {
                return res.status(400).json({ message: "Password confirmation token not found in cookies" });
            }
            
            const isTokenValid = await UserService.changePasswordService(newPassword, passwordConfirmation, emailUser);
            if (!isTokenValid.success) {
                return res.status(401).json({ message: "Password change failed" });
            }
            
            res.clearCookie("password_confirmation_token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
            return res.status(200).json({ message: "Password changed successfully", isTokenValid });
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async uploadUserProfileImage(req: AuthRequest, res: Response) {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      await Queue.add("uploadUserProfileImage", {
        localFilePath: req.file.path,
        userId: req.userId!,
      }, { priority: 3 });

      return res.status(202).json({ message: "Upload da imagem de perfil agendado com sucesso." });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }


}

export default new userController();