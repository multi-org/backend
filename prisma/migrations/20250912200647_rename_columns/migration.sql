/*
  Warnings:

  - You are about to drop the column `account` on the `company_payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `accountDigit` on the `company_payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `agency` on the `company_payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bankCode` on the `company_payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `company_payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `documentNumber` on the `company_payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `mpAccessToken` on the `company_payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `mpAccountId` on the `company_payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `ownerName` on the `company_payment_accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mp_account_id]` on the table `company_payment_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "multi"."company_payment_accounts_mpAccountId_key";

-- AlterTable
ALTER TABLE "multi"."company_payment_accounts" DROP COLUMN "account",
DROP COLUMN "accountDigit",
DROP COLUMN "agency",
DROP COLUMN "bankCode",
DROP COLUMN "bankName",
DROP COLUMN "documentNumber",
DROP COLUMN "mpAccessToken",
DROP COLUMN "mpAccountId",
DROP COLUMN "ownerName",
ADD COLUMN     "mp_access_token" VARCHAR(500),
ADD COLUMN     "mp_account_id" VARCHAR(255),
ADD COLUMN     "mp_refresh_token" VARCHAR(500),
ADD COLUMN     "mp_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "company_payment_accounts_mp_account_id_key" ON "multi"."company_payment_accounts"("mp_account_id");
