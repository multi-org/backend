/*
  Warnings:

  - You are about to drop the column `registrationNumber` on the `company_associates` table. All the data in the column will be lost.
  - Added the required column `userCpf` to the `company_associates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "multi"."company_associates" DROP COLUMN "registrationNumber",
ADD COLUMN     "documentUrl" VARCHAR(1000),
ADD COLUMN     "userCpf" VARCHAR(10) NOT NULL;
