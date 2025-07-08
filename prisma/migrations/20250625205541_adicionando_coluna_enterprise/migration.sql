/*
  Warnings:

  - A unique constraint covering the columns `[userId,enterpriseId,roleId]` on the table `enterprise_user_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `enterpriseId` to the `enterprise_user_roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "multi"."enterprise_user_roles" ADD COLUMN     "enterpriseId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_user_roles_userId_enterpriseId_roleId_key" ON "multi"."enterprise_user_roles"("userId", "enterpriseId", "roleId");

-- AddForeignKey
ALTER TABLE "multi"."enterprise_user_roles" ADD CONSTRAINT "enterprise_user_roles_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
