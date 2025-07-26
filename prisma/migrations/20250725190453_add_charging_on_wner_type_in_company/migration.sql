-- CreateEnum
CREATE TYPE "multi"."OwnerType" AS ENUM ('empresa', 'filial');

-- AlterTable
ALTER TABLE "multi"."enterprises" ADD COLUMN     "ownerType" "multi"."OwnerType" NOT NULL DEFAULT 'empresa';

-- AlterTable
ALTER TABLE "multi"."subsidiaries" ADD COLUMN     "ownerType" "multi"."OwnerType" NOT NULL DEFAULT 'filial';
