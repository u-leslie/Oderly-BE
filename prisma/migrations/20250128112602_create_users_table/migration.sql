/*
  Warnings:

  - The `createdAt` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "users_createdAt_key";

-- DropIndex
DROP INDEX "users_password_key";

-- DropIndex
DROP INDEX "users_updatedAt_key";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
