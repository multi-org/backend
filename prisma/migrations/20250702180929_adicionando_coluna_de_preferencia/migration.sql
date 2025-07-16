/*
  Warnings:

  - You are about to drop the column `enterpriseId` on the `enterprise_user_roles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "multi"."enterprise_user_roles" DROP CONSTRAINT "enterprise_user_roles_enterpriseId_fkey";

-- DropIndex
DROP INDEX "multi"."enterprise_user_roles_userId_enterpriseId_roleId_key";

-- AlterTable
ALTER TABLE "multi"."enterprise_user_roles" DROP COLUMN "enterpriseId";

-- AlterTable
ALTER TABLE "multi"."users" ADD COLUMN     "preferences" INTEGER[];
