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
CREATE TYPE "multi"."TypeAddress" AS ENUM ('usuário', 'empresa', 'filial');

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
    "description" VARCHAR(1000) NOT NULL,
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
CREATE TABLE "multi"."enterprises" (
    "id" UUID NOT NULL,
    "enterpriseEmail" VARCHAR(50) NOT NULL,
    "enterpriseName" VARCHAR(100) NOT NULL,
    "enterpriseDescription" VARCHAR(1000),
    "enterpriseCnpj" VARCHAR(20) NOT NULL,
    "microenterprise" BOOLEAN NOT NULL,
    "enterpriseMission" VARCHAR(255) NOT NULL,
    "enterprisePhone" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "multi"."Status" NOT NULL DEFAULT 'ativo',

    CONSTRAINT "enterprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."SubsidiaryCompany" (
    "id" UUID NOT NULL,
    "enterpriseId" UUID NOT NULL,

    CONSTRAINT "SubsidiaryCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."legal_representatives" (
    "enterpriseId" UUID NOT NULL,
    "idRepresentative" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_representatives_pkey" PRIMARY KEY ("enterpriseId","idRepresentative")
);

-- CreateTable
CREATE TABLE "multi"."company_associates" (
    "userId" UUID NOT NULL,
    "userRegistration" VARCHAR(20) NOT NULL,
    "enterpriseId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_associates_pkey" PRIMARY KEY ("userId","enterpriseId")
);

-- CreateTable
CREATE TABLE "multi"."Address" (
    "id" UUID NOT NULL,
    "typeAddress" "multi"."TypeAddress" NOT NULL,
    "userId" UUID,
    "enterpriseId" UUID,
    "subsidiaryId" UUID,
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

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."payments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "enterpriseId" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "multi"."PaymentMethod" NOT NULL,
    "status" "multi"."PaymentStatus" NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."products" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "availableDate" VARCHAR(1000)[] DEFAULT ARRAY[]::VARCHAR(1000)[],
    "type" "multi"."ProductType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "imagesUrls" VARCHAR(1000)[] DEFAULT ARRAY[]::VARCHAR(1000)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."rentService" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "serviceDescription" VARCHAR(1000),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "statusOfService" "multi"."RentStatus" NOT NULL DEFAULT 'pendente',
    "statusOfPayment" "multi"."PaymentStatus" NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rentService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "multi"."users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_key" ON "multi"."Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_enterpriseId_key" ON "multi"."Address"("enterpriseId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_subsidiaryId_key" ON "multi"."Address"("subsidiaryId");

-- CreateIndex
CREATE UNIQUE INDEX "products_id_key" ON "multi"."products"("id");

-- CreateIndex
CREATE UNIQUE INDEX "products_userId_key" ON "multi"."products"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rentService_id_key" ON "multi"."rentService"("id");

-- CreateIndex
CREATE UNIQUE INDEX "rentService_userId_key" ON "multi"."rentService"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rentService_productId_key" ON "multi"."rentService"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "rentService_paymentId_key" ON "multi"."rentService"("paymentId");

-- AddForeignKey
ALTER TABLE "multi"."roles_permissions" ADD CONSTRAINT "roles_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "multi"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."roles_permissions" ADD CONSTRAINT "roles_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "multi"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "multi"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."SubsidiaryCompany" ADD CONSTRAINT "SubsidiaryCompany_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."legal_representatives" ADD CONSTRAINT "legal_representatives_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."legal_representatives" ADD CONSTRAINT "legal_representatives_idRepresentative_fkey" FOREIGN KEY ("idRepresentative") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."company_associates" ADD CONSTRAINT "company_associates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."company_associates" ADD CONSTRAINT "company_associates_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."Address" ADD CONSTRAINT "Address_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."Address" ADD CONSTRAINT "Address_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "multi"."SubsidiaryCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
