/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- Add password column with default value for existing users
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'temp_password_needs_update';

-- Update existing users to have proper role
UPDATE "User" SET role = 'user' WHERE role IS NULL;
