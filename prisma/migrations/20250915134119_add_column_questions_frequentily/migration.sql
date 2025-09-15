/*
  Warnings:

  - You are about to drop the `company_payment_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "multi"."company_payment_accounts" DROP CONSTRAINT "company_payment_accounts_companyId_fkey";

-- DropTable
DROP TABLE "multi"."company_payment_accounts";

-- DropEnum
DROP TYPE "multi"."PaymentAccountType";

-- CreateTable
CREATE TABLE "multi"."frequently_asked_questions" (
    "id" UUID NOT NULL,
    "userWhoAsked" UUID NOT NULL,
    "question" VARCHAR(1000) NOT NULL,
    "answer" VARCHAR(2000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frequently_asked_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "multi"."frequently_asked_questions" ADD CONSTRAINT "frequently_asked_questions_userWhoAsked_fkey" FOREIGN KEY ("userWhoAsked") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
