/*
  Warnings:

  - You are about to drop the column `endTime` on the `rental_dates` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `rental_dates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rentId,date,hour]` on the table `rental_dates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "multi"."rental_dates_rentId_date_key";

-- AlterTable
ALTER TABLE "multi"."rental_dates" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "hour" VARCHAR(5);

-- CreateIndex
CREATE UNIQUE INDEX "rental_dates_rentId_date_hour_key" ON "multi"."rental_dates"("rentId", "date", "hour");
