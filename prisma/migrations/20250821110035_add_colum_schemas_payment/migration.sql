/*
  Warnings:

  - Added the required column `activityTitle` to the `rents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "multi"."payments" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "pixCode" VARCHAR(500);

-- AlterTable
ALTER TABLE "multi"."rents" ADD COLUMN     "activityDescription" VARCHAR(1000),
ADD COLUMN     "activityTitle" VARCHAR(255) NOT NULL,
ADD COLUMN     "chargingType" "multi"."chargingModel" NOT NULL DEFAULT 'por dia';
