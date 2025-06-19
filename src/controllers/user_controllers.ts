import { AuthRequest } from "@app/middlewares/global_middleware";
import { Request, Response } from "express";
import { createUserZode } from "@app/models/User_models";
import UserService from "@app/services/user_services";

class userController {
  async createUser(req: Request, res: Response) {
    const result = createUserZode.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({
        message: "Validation failed",
        errors: errors,
      });
    }
    try {
      const user = await UserService.createUser({
        ...result.data,
        isEmailVerified: false,
      });

      res.cookie("email", user.email, {
        httpOnly: true,
        maxAge: 20 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.status(201).send(user);
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        message: error.message || "Internal Server Error",
      });
    }
  }

  async validationEmailAndCreateUser(req: AuthRequest, res: Response) {
    const { email } = req.cookies;

    if (!email) {
      return res.status(500).json({ message: "Email not found in cookies" });
    }

    try {
      const user = await UserService.validEmailAndCreateUser(email, req.body);

      res.clearCookie("email", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      res.cookie("token", user.token, {
        httpOnly: true,
        maxAge: 6 * 60 * 60 * 1000, // 6 horas
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res
        .status(200)
        .json({ message: user.message, userName: user.userName });
    } catch (error: any) {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({
        message: error.message || "Internal Server Error",
      });
    }
  }
}

export default new userController();
