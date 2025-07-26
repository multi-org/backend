/*
  Warnings:

  - You are about to drop the column `ownerType` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "multi"."products" DROP COLUMN "ownerType";

-- DropEnum
DROP TYPE "multi"."OwnerType";
