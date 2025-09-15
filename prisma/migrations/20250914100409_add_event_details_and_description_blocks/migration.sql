-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "descriptionBlocks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "details" JSONB;
