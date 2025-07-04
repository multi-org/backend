-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "multi";

-- CreateEnum
CREATE TYPE "multi"."Status" AS ENUM ('ativo', 'inativo', 'suspenso', 'excluído');

-- CreateEnum
CREATE TYPE "multi"."ProductType" AS ENUM ('espaço', 'equipamento', 'serviço');

-- CreateEnum
CREATE TYPE "multi"."PaymentStatus" AS ENUM ('pendente', 'completo', 'falhou', 'reembolsado');

-- CreateEnum
CREATE TYPE "multi"."PaymentMethod" AS ENUM ('cartão de crédito', 'cartão de débito', 'pix', 'boleto bancário');

-- CreateEnum
CREATE TYPE "multi"."RentStatus" AS ENUM ('pendente', 'confirmado', 'cancelado', 'completo');

-- CreateEnum
CREATE TYPE "multi"."AddressType" AS ENUM ('usuário', 'empresa', 'filial');

-- CreateTable
CREATE TABLE "multi"."users" (
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "profileImageUrl" VARCHAR(1000),
    "password" VARCHAR(255) NOT NULL,
    "cpf" VARCHAR(255) NOT NULL,
    "birthDate" DATE NOT NULL,
    "status" "multi"."Status" NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "multi"."roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."permissions" (
    "id" SERIAL NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "description" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."roles_permissions" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "multi"."user_roles" (
    "userId" UUID NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "multi"."enterprise_user_roles" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enterprise_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."enterprises" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "description" VARCHAR(1000),
    "mission" VARCHAR(255),
    "isMicroenterprise" BOOLEAN NOT NULL DEFAULT false,
    "status" "multi"."Status" NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "associateDiscountRate" DECIMAL(5,4) NOT NULL DEFAULT 0.0,

    CONSTRAINT "enterprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."subsidiaries" (
    "id" UUID NOT NULL,
    "enterpriseId" UUID NOT NULL,
    "name" VARCHAR(100),
    "email" VARCHAR(50),
    "phone" VARCHAR(20),
    "cnpj" VARCHAR(18),
    "status" "multi"."Status" NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subsidiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."legal_representatives" (
    "enterpriseId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_representatives_pkey" PRIMARY KEY ("enterpriseId","userId")
);

-- CreateTable
CREATE TABLE "multi"."company_associates" (
    "userId" UUID NOT NULL,
    "registrationNumber" VARCHAR(10) NOT NULL,
    "enterpriseId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_associates_pkey" PRIMARY KEY ("userId","enterpriseId")
);

-- CreateTable
CREATE TABLE "multi"."addresses" (
    "id" UUID NOT NULL,
    "typeAddress" "multi"."AddressType" NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "number" VARCHAR(20) NOT NULL,
    "complement" VARCHAR(255),
    "neighborhood" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,
    "enterpriseId" UUID,
    "subsidiaryId" UUID,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."payments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "multi"."PaymentMethod" NOT NULL,
    "status" "multi"."PaymentStatus" NOT NULL DEFAULT 'pendente',
    "transactionId" VARCHAR(255),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."products" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "ownerType" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "type" "multi"."ProductType" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "imagesUrls" VARCHAR(1000)[] DEFAULT ARRAY[]::VARCHAR(1000)[],
    "status" "multi"."Status" NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."rents" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "paymentId" UUID,
    "description" VARCHAR(1000),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "discountApplied" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "status" "multi"."RentStatus" NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."product_availabilities" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "priceOverride" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."_EnterpriseToProduct" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_EnterpriseToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "multi"."_ProductToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "multi"."_ProductToSubsidiary" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductToSubsidiary_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "multi"."users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subsidiaries_cnpj_key" ON "multi"."subsidiaries"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_userId_key" ON "multi"."addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_enterpriseId_key" ON "multi"."addresses"("enterpriseId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_subsidiaryId_key" ON "multi"."addresses"("subsidiaryId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "multi"."payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "rents_paymentId_key" ON "multi"."rents"("paymentId");

-- CreateIndex
CREATE INDEX "_EnterpriseToProduct_B_index" ON "multi"."_EnterpriseToProduct"("B");

-- CreateIndex
CREATE INDEX "_ProductToUser_B_index" ON "multi"."_ProductToUser"("B");

-- CreateIndex
CREATE INDEX "_ProductToSubsidiary_B_index" ON "multi"."_ProductToSubsidiary"("B");

-- AddForeignKey
ALTER TABLE "multi"."roles_permissions" ADD CONSTRAINT "roles_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "multi"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."roles_permissions" ADD CONSTRAINT "roles_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "multi"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "multi"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."enterprise_user_roles" ADD CONSTRAINT "enterprise_user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."enterprise_user_roles" ADD CONSTRAINT "enterprise_user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "multi"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."subsidiaries" ADD CONSTRAINT "subsidiaries_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."legal_representatives" ADD CONSTRAINT "legal_representatives_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."legal_representatives" ADD CONSTRAINT "legal_representatives_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."company_associates" ADD CONSTRAINT "company_associates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."company_associates" ADD CONSTRAINT "company_associates_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."addresses" ADD CONSTRAINT "addresses_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."addresses" ADD CONSTRAINT "addresses_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "multi"."subsidiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."rents" ADD CONSTRAINT "rents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."rents" ADD CONSTRAINT "rents_productId_fkey" FOREIGN KEY ("productId") REFERENCES "multi"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."rents" ADD CONSTRAINT "rents_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "multi"."payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."product_availabilities" ADD CONSTRAINT "product_availabilities_productId_fkey" FOREIGN KEY ("productId") REFERENCES "multi"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."_EnterpriseToProduct" ADD CONSTRAINT "_EnterpriseToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."_EnterpriseToProduct" ADD CONSTRAINT "_EnterpriseToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "multi"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."_ProductToUser" ADD CONSTRAINT "_ProductToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "multi"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."_ProductToUser" ADD CONSTRAINT "_ProductToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."_ProductToSubsidiary" ADD CONSTRAINT "_ProductToSubsidiary_A_fkey" FOREIGN KEY ("A") REFERENCES "multi"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."_ProductToSubsidiary" ADD CONSTRAINT "_ProductToSubsidiary_B_fkey" FOREIGN KEY ("B") REFERENCES "multi"."subsidiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
