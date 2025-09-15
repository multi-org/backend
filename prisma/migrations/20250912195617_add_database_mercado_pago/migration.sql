-- CreateEnum
CREATE TYPE "multi"."PaymentAccountType" AS ENUM ('conta_bancaria', 'mercado_pago', 'paypal');

-- CreateTable
CREATE TABLE "multi"."company_payment_accounts" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "accountType" "multi"."PaymentAccountType" NOT NULL,
    "bankName" VARCHAR(255),
    "bankCode" VARCHAR(20),
    "agency" VARCHAR(20),
    "account" VARCHAR(50),
    "accountDigit" VARCHAR(5),
    "documentNumber" VARCHAR(20),
    "ownerName" VARCHAR(255),
    "mpAccountId" VARCHAR(255),
    "mpAccessToken" VARCHAR(500),
    "status" "multi"."Status" NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_payment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_payment_accounts_companyId_key" ON "multi"."company_payment_accounts"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_payment_accounts_mpAccountId_key" ON "multi"."company_payment_accounts"("mpAccountId");

-- AddForeignKey
ALTER TABLE "multi"."company_payment_accounts" ADD CONSTRAINT "company_payment_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
