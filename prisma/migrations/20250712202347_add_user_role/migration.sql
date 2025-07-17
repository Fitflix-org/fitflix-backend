-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('user', 'admin', 'staff');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRoleEnum" NOT NULL DEFAULT 'user';
