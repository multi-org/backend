/*
  Warnings:

  - You are about to drop the column `basePrice` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `billingModel` on the `products` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "multi"."chargingModel" AS ENUM ('por dia', 'por hora', 'ambos');

-- AlterTable
ALTER TABLE "multi"."products" DROP COLUMN "basePrice",
DROP COLUMN "billingModel",
ADD COLUMN     "chargingModel" "multi"."chargingModel" NOT NULL DEFAULT 'por dia';

-- DropEnum
DROP TYPE "multi"."BillingModel";
