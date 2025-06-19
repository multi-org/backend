import { PrismaClient } from "@prisma/client";
import { createUserDTOS } from "@app/models/User_models";

const prisma = new PrismaClient();

export class UserRepository {
  async createUser(userData: createUserDTOS & { isEmailVerified: boolean }) {
    const user = await prisma.user.create({
      data: userData,
    });
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        status: "ACTIVE",
      },
    });
    return user;
  }
}

export default new UserRepository();