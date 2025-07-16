/*
  Warnings:

  - The values [usuário] on the enum `OwnerType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `enterpriseId` on the `addresses` table. All the data in the column will be lost.
  - The primary key for the `company_associates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `enterpriseId` on the `company_associates` table. All the data in the column will be lost.
  - You are about to drop the column `enterpriseId` on the `enterprise_user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `mission` on the `enterprises` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `enterprises` table. All the data in the column will be lost.
  - The primary key for the `legal_representatives` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `enterpriseId` on the `legal_representatives` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `services_products` table. All the data in the column will be lost.
  - You are about to drop the column `enterpriseId` on the `subsidiaries` table. All the data in the column will be lost.
  - You are about to drop the `_EnterpriseToProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToSubsidiary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[companyId]` on the table `addresses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,companyId,roleId]` on the table `enterprise_user_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `company_associates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `enterprise_user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `enterprises` table without a default value. This is not possible if the table is not empty.
  - Added the required column `popularName` to the `enterprises` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `legal_representatives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `subsidiaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `subsidiaries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "multi"."OwnerType_new" AS ENUM ('empresa', 'filial');
ALTER TABLE "multi"."products" ALTER COLUMN "ownerType" TYPE "multi"."OwnerType_new" USING ("ownerType"::text::"multi"."OwnerType_new");
ALTER TYPE "multi"."OwnerType" RENAME TO "OwnerType_old";
ALTER TYPE "multi"."OwnerType_new" RENAME TO "OwnerType";
DROP TYPE "multi"."OwnerType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "multi"."_EnterpriseToProduct" DROP CONSTRAINT "_EnterpriseToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "multi"."_EnterpriseToProduct" DROP CONSTRAINT "_EnterpriseToProduct_B_fkey";

-- DropForeignKey
ALTER TABLE "multi"."_ProductToSubsidiary" DROP CONSTRAINT "_ProductToSubsidiary_A_fkey";

-- DropForeignKey
ALTER TABLE "multi"."_ProductToSubsidiary" DROP CONSTRAINT "_ProductToSubsidiary_B_fkey";

-- DropForeignKey
ALTER TABLE "multi"."_ProductToUser" DROP CONSTRAINT "_ProductToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "multi"."_ProductToUser" DROP CONSTRAINT "_ProductToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "multi"."addresses" DROP CONSTRAINT "addresses_enterpriseId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."company_associates" DROP CONSTRAINT "company_associates_enterpriseId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."enterprise_user_roles" DROP CONSTRAINT "enterprise_user_roles_enterpriseId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."legal_representatives" DROP CONSTRAINT "legal_representatives_enterpriseId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."subsidiaries" DROP CONSTRAINT "subsidiaries_enterpriseId_fkey";

-- DropIndex
DROP INDEX "multi"."addresses_enterpriseId_key";

-- DropIndex
DROP INDEX "multi"."enterprise_user_roles_userId_enterpriseId_roleId_key";

-- AlterTable
ALTER TABLE "multi"."addresses" DROP COLUMN "enterpriseId",
ADD COLUMN     "companyId" UUID;

-- AlterTable
ALTER TABLE "multi"."company_associates" DROP CONSTRAINT "company_associates_pkey",
DROP COLUMN "enterpriseId",
ADD COLUMN     "companyId" UUID NOT NULL,
ADD CONSTRAINT "company_associates_pkey" PRIMARY KEY ("userId", "companyId");

-- AlterTable
ALTER TABLE "multi"."enterprise_user_roles" DROP COLUMN "enterpriseId",
ADD COLUMN     "companyId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "multi"."enterprises" DROP COLUMN "mission",
DROP COLUMN "name",
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "legalName" VARCHAR(255),
ADD COLUMN     "popularName" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "multi"."legal_representatives" DROP CONSTRAINT "legal_representatives_pkey",
DROP COLUMN "enterpriseId",
ADD COLUMN     "companyId" UUID NOT NULL,
ADD CONSTRAINT "legal_representatives_pkey" PRIMARY KEY ("companyId", "userId");

-- AlterTable
ALTER TABLE "multi"."products" ADD COLUMN     "createdBy" UUID NOT NULL;

-- AlterTable
ALTER TABLE "multi"."services_products" DROP COLUMN "duration",
ADD COLUMN     "durationMinutes" INTEGER;

-- AlterTable
ALTER TABLE "multi"."subsidiaries" DROP COLUMN "enterpriseId",
ADD COLUMN     "companyId" UUID NOT NULL,
ADD COLUMN     "createdBy" UUID NOT NULL;

-- DropTable
DROP TABLE "multi"."_EnterpriseToProduct";

-- DropTable
DROP TABLE "multi"."_ProductToSubsidiary";

-- DropTable
DROP TABLE "multi"."_ProductToUser";

-- CreateIndex
CREATE UNIQUE INDEX "addresses_companyId_key" ON "multi"."addresses"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_user_roles_userId_companyId_roleId_key" ON "multi"."enterprise_user_roles"("userId", "companyId", "roleId");

-- AddForeignKey
ALTER TABLE "multi"."enterprise_user_roles" ADD CONSTRAINT "enterprise_user_roles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."subsidiaries" ADD CONSTRAINT "subsidiaries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."legal_representatives" ADD CONSTRAINT "legal_representatives_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."company_associates" ADD CONSTRAINT "company_associates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."addresses" ADD CONSTRAINT "addresses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
