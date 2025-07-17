-- CreateEnum
CREATE TYPE "multi"."BillingModel" AS ENUM ('por dia', 'por hora', 'por mês', 'fixo');

-- AlterTable
ALTER TABLE "multi"."products" ADD COLUMN     "billingModel" "multi"."BillingModel" NOT NULL DEFAULT 'por dia';

-- CreateTable
CREATE TABLE "multi"."product_weekly_availabilities" (
    "productId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_weekly_availabilities_pkey" PRIMARY KEY ("productId","dayOfWeek")
);

-- AddForeignKey
ALTER TABLE "multi"."product_weekly_availabilities" ADD CONSTRAINT "product_weekly_availabilities_productId_fkey" FOREIGN KEY ("productId") REFERENCES "multi"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
