/*
  Warnings:

  - The values [ACTIVE,INACTIVE,SUSPENDED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('espaço', 'equipamento', 'serviço');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pendente', 'completo', 'falhou', 'reembolsado');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cartão de crédito', 'cartão de débito', 'pix', 'boleto bancário');

-- CreateEnum
CREATE TYPE "RentStatus" AS ENUM ('pendente', 'confirmado', 'cancelado', 'completo');

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ativo', 'inativo', 'suspenso');
ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ativo';
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profileImageUrl" VARCHAR(1000),
ALTER COLUMN "status" SET DEFAULT 'ativo';

-- CreateTable
CREATE TABLE "enterprises" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "enterpriseName" VARCHAR(255),
    "cnpjOrCpf" VARCHAR(255) NOT NULL,
    "enterpriseMission" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "legalRepresentativeName" VARCHAR(255) NOT NULL,
    "legalRepresentativeCpf" VARCHAR(255) NOT NULL,
    "legalRepresentativeEmail" VARCHAR(255) NOT NULL,
    "legalRepresentativePhone" VARCHAR(255) NOT NULL,
    "legalRepresentativeBirthDate" DATE NOT NULL,
    "legalRepresentativeAddress" VARCHAR(255) NOT NULL,
    "legalRepresentativeCertificate" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isLegalRepresentativeEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isLegalRepresentativePhoneVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "enterprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "enterpriseId" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "availableDate" VARCHAR(1000)[] DEFAULT ARRAY[]::VARCHAR(1000)[],
    "type" "ProductType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "imagesUrls" VARCHAR(1000)[] DEFAULT ARRAY[]::VARCHAR(1000)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rentService" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "serviceDescription" VARCHAR(1000),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "statusOfService" "RentStatus" NOT NULL DEFAULT 'pendente',
    "statusOfPayment" "PaymentStatus" NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rentService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_id_key" ON "products"("id");

-- CreateIndex
CREATE UNIQUE INDEX "products_userId_key" ON "products"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rentService_id_key" ON "rentService"("id");

-- CreateIndex
CREATE UNIQUE INDEX "rentService_userId_key" ON "rentService"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rentService_productId_key" ON "rentService"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "rentService_paymentId_key" ON "rentService"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "users"("userId");
