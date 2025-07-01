/*
  Warnings:

  - A unique constraint covering the columns `[rentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "multi"."rents" DROP CONSTRAINT "rents_paymentId_fkey";

-- AlterTable
ALTER TABLE "multi"."payments" ADD COLUMN     "rentId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "payments_rentId_key" ON "multi"."payments"("rentId");

-- AddForeignKey
ALTER TABLE "multi"."payments" ADD CONSTRAINT "payments_rentId_fkey" FOREIGN KEY ("rentId") REFERENCES "multi"."rents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
