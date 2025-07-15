/*
  Warnings:

  - You are about to alter the column `cpf` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(15)`.

*/
-- AlterTable
ALTER TABLE "multi"."company_associates" ALTER COLUMN "userCpf" SET DATA TYPE VARCHAR(15);

-- AlterTable
ALTER TABLE "multi"."users" ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(15);
