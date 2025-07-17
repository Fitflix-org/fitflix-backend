/*
  Warnings:

  - The primary key for the `gym_amenities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `event_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `membership_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_for` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `service_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `user_trainer_id` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - The `status` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `membership_id` on the `user_memberships` table. All the data in the column will be lost.
  - The `status` column on the `user_memberships` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `address` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `food_preferences` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lifestyle` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `zip_code` on the `user_profiles` table. All the data in the column will be lost.
  - The `gender` column on the `user_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `amenities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gym_activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gym_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gym_services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gym_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gyms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `memberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_trainers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[gym_id,name]` on the table `gym_amenities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[digital_pass_code]` on the table `user_memberships` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `gym_amenities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `digital_pass_code` to the `user_memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_id` to the `user_memberships` table without a default value. This is not possible if the table is not empty.
  - Made the column `end_date` on table `user_memberships` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "MembershipStatusEnum" AS ENUM ('not_started', 'active', 'ended', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "NotificationTypeEnum" AS ENUM ('offer', 'gym_announcement', 'workout_reminder', 'hydration_reminder', 'membership_renewal');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('success', 'pending', 'failed', 'refunded');

-- DropForeignKey
ALTER TABLE "event_bookings" DROP CONSTRAINT "fk_eb_event";

-- DropForeignKey
ALTER TABLE "event_bookings" DROP CONSTRAINT "fk_eb_user";

-- DropForeignKey
ALTER TABLE "event_bookings" DROP CONSTRAINT "fk_eventbooking_payment";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "fk_events_activity";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "fk_events_gym";

-- DropForeignKey
ALTER TABLE "gym_activities" DROP CONSTRAINT "fk_gyma_activity";

-- DropForeignKey
ALTER TABLE "gym_activities" DROP CONSTRAINT "fk_gyma_gym";

-- DropForeignKey
ALTER TABLE "gym_amenities" DROP CONSTRAINT "fk_ga_amenity";

-- DropForeignKey
ALTER TABLE "gym_amenities" DROP CONSTRAINT "fk_ga_gym";

-- DropForeignKey
ALTER TABLE "gym_info" DROP CONSTRAINT "fk_gym_info_gym";

-- DropForeignKey
ALTER TABLE "gym_services" DROP CONSTRAINT "fk_gs_gym";

-- DropForeignKey
ALTER TABLE "gym_services" DROP CONSTRAINT "fk_gs_service";

-- DropForeignKey
ALTER TABLE "gyms" DROP CONSTRAINT "fk_gym_type";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "fk_membership_gym";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "fk_pay_event";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "fk_pay_membership";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "fk_pay_service";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "fk_pay_user";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "fk_pay_user_trainer";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "fk_payments_staff";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "fk_services_gym";

-- DropForeignKey
ALTER TABLE "staff" DROP CONSTRAINT "fk_staff_gym";

-- DropForeignKey
ALTER TABLE "staff" DROP CONSTRAINT "fk_staff_user";

-- DropForeignKey
ALTER TABLE "user_memberships" DROP CONSTRAINT "fk_um_membership";

-- DropForeignKey
ALTER TABLE "user_memberships" DROP CONSTRAINT "fk_um_user";

-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "fk_profile_user";

-- DropForeignKey
ALTER TABLE "user_trainers" DROP CONSTRAINT "fk_ut_payment";

-- DropForeignKey
ALTER TABLE "user_trainers" DROP CONSTRAINT "fk_ut_trainer";

-- DropForeignKey
ALTER TABLE "user_trainers" DROP CONSTRAINT "fk_ut_user";

-- DropIndex
DROP INDEX "idx_ga_gym";

-- AlterTable
ALTER TABLE "gym_amenities" DROP CONSTRAINT "gym_amenities_pkey",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "icon_url" TEXT,
ADD COLUMN     "name" VARCHAR(100) NOT NULL,
ALTER COLUMN "amenity_id" SET DEFAULT gen_random_uuid(),
ADD CONSTRAINT "gym_amenities_pkey" PRIMARY KEY ("amenity_id");

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "event_id",
DROP COLUMN "membership_id",
DROP COLUMN "payment_for",
DROP COLUMN "service_id",
DROP COLUMN "staff_id",
DROP COLUMN "user_trainer_id",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatusEnum";

-- AlterTable
ALTER TABLE "user_memberships" DROP COLUMN "membership_id",
ADD COLUMN     "auto_renewal_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "digital_pass_code" VARCHAR(100) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "plan_id" UUID NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "start_date" DROP DEFAULT,
ALTER COLUMN "end_date" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "MembershipStatusEnum" NOT NULL DEFAULT 'not_started';

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "food_preferences",
DROP COLUMN "lifestyle",
DROP COLUMN "state",
DROP COLUMN "zip_code",
ADD COLUMN     "allergies" TEXT[],
ADD COLUMN     "dietary_preferences" TEXT[],
ADD COLUMN     "primary_fitness_goal" VARCHAR(100),
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "gender",
ADD COLUMN     "gender" "GenderEnum",
ALTER COLUMN "profile_picture_url" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "activities";

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "amenities";

-- DropTable
DROP TABLE "event_bookings";

-- DropTable
DROP TABLE "events";

-- DropTable
DROP TABLE "gym_activities";

-- DropTable
DROP TABLE "gym_info";

-- DropTable
DROP TABLE "gym_services";

-- DropTable
DROP TABLE "gym_types";

-- DropTable
DROP TABLE "gyms";

-- DropTable
DROP TABLE "memberships";

-- DropTable
DROP TABLE "services";

-- DropTable
DROP TABLE "staff";

-- DropTable
DROP TABLE "user_trainers";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "attendance_status_enum";

-- DropEnum
DROP TYPE "gender_enum";

-- DropEnum
DROP TYPE "membership_status_enum";

-- DropEnum
DROP TYPE "payment_for_enum";

-- DropEnum
DROP TYPE "payment_status_enum";

-- DropEnum
DROP TYPE "staff_type_enum";

-- CreateTable
CREATE TABLE "Gym" (
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

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("gym_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "exercise_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50),
    "description" TEXT,
    "primary_muscle_groups" TEXT[],
    "equipment_needed" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("exercise_id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "faq_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" VARCHAR(100),
    "order_index" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("faq_id")
);

-- CreateTable
CREATE TABLE "food_items" (
    "food_item_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "calories_per_100g" DECIMAL(7,2) NOT NULL,
    "protein_per_100g" DECIMAL(7,2) NOT NULL,
    "carbs_per_100g" DECIMAL(7,2) NOT NULL,
    "fat_per_100g" DECIMAL(7,2) NOT NULL,
    "common_portions_json" JSONB,
    "barcode" VARCHAR(100),
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("food_item_id")
);

-- CreateTable
CREATE TABLE "gym_classes_services" (
    "class_service_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "duration_minutes" INTEGER,
    "price" DECIMAL(10,2),
    "is_class" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_classes_services_pkey" PRIMARY KEY ("class_service_id")
);

-- CreateTable
CREATE TABLE "gym_media" (
    "media_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "media_type" VARCHAR(50) NOT NULL,
    "is_thumbnail" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_media_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "gym_trial_passes" (
    "pass_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "issued_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" DATE NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "digital_pass_code" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_trial_passes_pkey" PRIMARY KEY ("pass_id")
);

-- CreateTable
CREATE TABLE "hydration_logs" (
    "log_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "log_date" DATE NOT NULL,
    "amount_ml" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hydration_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "meal_entries" (
    "entry_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meal_id" UUID NOT NULL,
    "food_item_id" UUID NOT NULL,
    "quantity" DECIMAL(7,2) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "calories_consumed" DECIMAL(7,2),
    "protein_g" DECIMAL(7,2),
    "carbs_g" DECIMAL(7,2),
    "fat_g" DECIMAL(7,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "meals" (
    "meal_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "meal_date" DATE NOT NULL,
    "meal_time" TIME(6) NOT NULL,
    "meal_type" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "total_calories" DECIMAL(7,2),
    "total_protein_g" DECIMAL(7,2),
    "total_carbs_g" DECIMAL(7,2),
    "total_fat_g" DECIMAL(7,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("meal_id")
);

-- CreateTable
CREATE TABLE "membership_plans" (
    "plan_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "terms_conditions_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationTypeEnum",
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "related_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "offers" (
    "offer_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "discount_percentage" DECIMAL(5,2),
    "fixed_discount_amount" DECIMAL(10,2),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "target_gym_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("offer_id")
);

-- CreateTable
CREATE TABLE "user_goals" (
    "goal_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "goal_type" VARCHAR(100) NOT NULL,
    "target_value" DECIMAL(10,2) NOT NULL,
    "current_value" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "unit" VARCHAR(50),
    "start_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" DATE,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_goals_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "workout_entries" (
    "entry_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workout_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "weight_kg" DECIMAL(7,2),
    "duration_minutes" INTEGER,
    "distance_km" DECIMAL(7,2),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_entries_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "workout_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "workout_date" DATE NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "total_calories_burned" DECIMAL(7,2),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("workout_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");

-- CreateIndex
CREATE UNIQUE INDEX "food_items_name_key" ON "food_items"("name");

-- CreateIndex
CREATE UNIQUE INDEX "food_items_barcode_key" ON "food_items"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "gym_trial_passes_digital_pass_code_key" ON "gym_trial_passes"("digital_pass_code");

-- CreateIndex
CREATE UNIQUE INDEX "gym_amenities_gym_id_name_key" ON "gym_amenities"("gym_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "user_memberships_digital_pass_code_key" ON "user_memberships"("digital_pass_code");

-- AddForeignKey
ALTER TABLE "gym_amenities" ADD CONSTRAINT "fk_ga_gym" FOREIGN KEY ("gym_id") REFERENCES "Gym"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_pay_user" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "membership_plans"("plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "fk_um_user" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "fk_profile_user" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_classes_services" ADD CONSTRAINT "gym_classes_services_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "Gym"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_media" ADD CONSTRAINT "gym_media_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "Gym"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_trial_passes" ADD CONSTRAINT "gym_trial_passes_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "Gym"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_trial_passes" ADD CONSTRAINT "gym_trial_passes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hydration_logs" ADD CONSTRAINT "hydration_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("food_item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("meal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_plans" ADD CONSTRAINT "membership_plans_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "Gym"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_target_gym_id_fkey" FOREIGN KEY ("target_gym_id") REFERENCES "Gym"("gym_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_entries" ADD CONSTRAINT "workout_entries_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("exercise_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_entries" ADD CONSTRAINT "workout_entries_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("workout_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
