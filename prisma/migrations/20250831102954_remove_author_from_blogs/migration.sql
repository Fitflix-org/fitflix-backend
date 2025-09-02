/*
  Warnings:

  - You are about to drop the column `authorId` on the `Blog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_authorId_fkey";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "authorId";
