/*
  Warnings:

  - Added the required column `authorId` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the column as nullable
ALTER TABLE "Blog" ADD COLUMN "authorId" UUID;

-- Update existing blogs to use the admin user as author
UPDATE "Blog" SET "authorId" = (SELECT id FROM "User" WHERE email = 'admin@fitflix.com' LIMIT 1);

-- Make the column NOT NULL after updating existing data
ALTER TABLE "Blog" ALTER COLUMN "authorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
