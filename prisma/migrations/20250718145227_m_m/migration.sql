/*
  Warnings:

  - The primary key for the `gym_amenities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `icon_url` on the `gym_amenities` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `gym_amenities` table. All the data in the column will be lost.
  - You are about to drop the `Gym` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "gym_amenities" DROP CONSTRAINT "fk_ga_gym";

-- DropForeignKey
ALTER TABLE "gym_classes_services" DROP CONSTRAINT "gym_classes_services_gym_id_fkey";

-- DropForeignKey
ALTER TABLE "gym_media" DROP CONSTRAINT "gym_media_gym_id_fkey";

-- DropForeignKey
ALTER TABLE "gym_trial_passes" DROP CONSTRAINT "gym_trial_passes_gym_id_fkey";

-- DropForeignKey
ALTER TABLE "membership_plans" DROP CONSTRAINT "membership_plans_gym_id_fkey";

-- DropForeignKey
ALTER TABLE "offers" DROP CONSTRAINT "offers_target_gym_id_fkey";

-- DropIndex
DROP INDEX "gym_amenities_gym_id_name_key";

-- AlterTable
ALTER TABLE "gym_amenities" DROP CONSTRAINT "gym_amenities_pkey",
DROP COLUMN "icon_url",
DROP COLUMN "name",
ALTER COLUMN "amenity_id" DROP DEFAULT,
ADD CONSTRAINT "gym_amenities_pkey" PRIMARY KEY ("gym_id", "amenity_id");

-- DropTable
DROP TABLE "Gym";

-- CreateTable
CREATE TABLE "gyms" (
    "gym_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "phone_number" VARCHAR(20),
    "email" VARCHAR(255),
    "opening_time" TIME(6) NOT NULL,
    "closing_time" TIME(6) NOT NULL,
    "holiday_dates" DATE[],
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "gyms_pkey" PRIMARY KEY ("gym_id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "amenity_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "icon_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("amenity_id")
);

-- AddForeignKey
ALTER TABLE "gym_amenities" ADD CONSTRAINT "gym_amenities_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_amenities" ADD CONSTRAINT "gym_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("amenity_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_classes_services" ADD CONSTRAINT "gym_classes_services_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_media" ADD CONSTRAINT "gym_media_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_trial_passes" ADD CONSTRAINT "gym_trial_passes_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_plans" ADD CONSTRAINT "membership_plans_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_target_gym_id_fkey" FOREIGN KEY ("target_gym_id") REFERENCES "gyms"("gym_id") ON DELETE SET NULL ON UPDATE CASCADE;
