/*
  Warnings:

  - You are about to drop the column `endDate` on the `rents` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `rents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "multi"."rents" DROP COLUMN "endDate",
DROP COLUMN "startDate";

-- CreateTable
CREATE TABLE "multi"."rental_dates" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "rentId" UUID NOT NULL,

    CONSTRAINT "rental_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rental_dates_rentId_date_key" ON "multi"."rental_dates"("rentId", "date");

-- AddForeignKey
ALTER TABLE "multi"."rental_dates" ADD CONSTRAINT "rental_dates_rentId_fkey" FOREIGN KEY ("rentId") REFERENCES "multi"."rents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
