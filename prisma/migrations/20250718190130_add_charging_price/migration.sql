/*
  Warnings:

  - The values [por mês,fixo] on the enum `BillingModel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "multi"."BillingModel_new" AS ENUM ('por dia', 'por hora', 'ambos');
ALTER TABLE "multi"."products" ALTER COLUMN "billingModel" DROP DEFAULT;
ALTER TABLE "multi"."products" ALTER COLUMN "billingModel" TYPE "multi"."BillingModel_new" USING ("billingModel"::text::"multi"."BillingModel_new");
ALTER TYPE "multi"."BillingModel" RENAME TO "BillingModel_old";
ALTER TYPE "multi"."BillingModel_new" RENAME TO "BillingModel";
DROP TYPE "multi"."BillingModel_old";
ALTER TABLE "multi"."products" ALTER COLUMN "billingModel" SET DEFAULT 'por dia';
COMMIT;

-- AlterTable
ALTER TABLE "multi"."products" ADD COLUMN     "dailyPrice" DECIMAL(10,2),
ADD COLUMN     "hourlyPrice" DECIMAL(10,2),
ALTER COLUMN "basePrice" DROP NOT NULL;
