/*
  Warnings:

  - Added the required column `phoneSubsidiary` to the `SubsidiaryCompany` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "multi"."SubsidiaryCompany" ADD COLUMN     "cnpjSubsidiary" VARCHAR(20),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailSubsidiary" VARCHAR(50),
ADD COLUMN     "nameSubsidiary" VARCHAR(100),
ADD COLUMN     "phoneSubsidiary" VARCHAR(20) NOT NULL,
ADD COLUMN     "status" "multi"."Status" NOT NULL DEFAULT 'ativo',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
