/*
  Warnings:

  - You are about to drop the column `name` on the `products` table. All the data in the column will be lost.
  - You are about to alter the column `description` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(1000)` to `VarChar(300)`.
  - A unique constraint covering the columns `[userId,enterpriseId,roleId]` on the table `enterprise_user_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `enterpriseId` to the `enterprise_user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `products` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `ownerType` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `description` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "multi"."OwnerType" AS ENUM ('usuário', 'empresa', 'filial');

-- AlterTable
ALTER TABLE "multi"."enterprise_user_roles" ADD COLUMN     "enterpriseId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "multi"."products" DROP COLUMN "name",
ADD COLUMN     "category" VARCHAR(500) NOT NULL,
ADD COLUMN     "title" VARCHAR(255) NOT NULL,
ADD COLUMN     "unity" VARCHAR(50),
DROP COLUMN "ownerType",
ADD COLUMN     "ownerType" "multi"."OwnerType" NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(300);

-- CreateTable
CREATE TABLE "multi"."space_products" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "capacity" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "space_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."services_products" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "duration" TIME(0),
    "requirements" VARCHAR(500),

    CONSTRAINT "services_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multi"."equipment_products" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "specifications" VARCHAR(1000),
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "equipment_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "space_products_productId_key" ON "multi"."space_products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "services_products_productId_key" ON "multi"."services_products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_products_productId_key" ON "multi"."equipment_products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_user_roles_userId_enterpriseId_roleId_key" ON "multi"."enterprise_user_roles"("userId", "enterpriseId", "roleId");

-- AddForeignKey
ALTER TABLE "multi"."enterprise_user_roles" ADD CONSTRAINT "enterprise_user_roles_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."space_products" ADD CONSTRAINT "space_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "multi"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."services_products" ADD CONSTRAINT "services_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "multi"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."equipment_products" ADD CONSTRAINT "equipment_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "multi"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
