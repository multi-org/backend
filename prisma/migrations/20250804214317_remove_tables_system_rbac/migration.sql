/*
  Warnings:

  - You are about to drop the `enterprise_user_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "multi"."enterprise_user_roles" DROP CONSTRAINT "enterprise_user_roles_companyId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."enterprise_user_roles" DROP CONSTRAINT "enterprise_user_roles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."enterprise_user_roles" DROP CONSTRAINT "enterprise_user_roles_userId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."roles_permissions" DROP CONSTRAINT "roles_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."roles_permissions" DROP CONSTRAINT "roles_permissions_roleId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."user_roles" DROP CONSTRAINT "user_roles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "multi"."user_roles" DROP CONSTRAINT "user_roles_userId_fkey";

-- DropTable
DROP TABLE "multi"."enterprise_user_roles";

-- DropTable
DROP TABLE "multi"."permissions";

-- DropTable
DROP TABLE "multi"."roles";

-- DropTable
DROP TABLE "multi"."roles_permissions";

-- DropTable
DROP TABLE "multi"."user_roles";

-- CreateTable
CREATE TABLE "multi"."user_system_roles" (
    "userId" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'commonUser',

    CONSTRAINT "user_system_roles_pkey" PRIMARY KEY ("userId","role")
);

-- CreateTable
CREATE TABLE "multi"."user_company_roles" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL,

    CONSTRAINT "user_company_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_company_roles_userId_companyId_role_key" ON "multi"."user_company_roles"("userId", "companyId", "role");

-- AddForeignKey
ALTER TABLE "multi"."user_system_roles" ADD CONSTRAINT "user_system_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."user_company_roles" ADD CONSTRAINT "user_company_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "multi"."users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multi"."user_company_roles" ADD CONSTRAINT "user_company_roles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "multi"."enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
