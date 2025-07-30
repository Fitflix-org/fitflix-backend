-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('user', 'admin', 'staff');

-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "MembershipStatusEnum" AS ENUM ('not_started', 'active', 'ended', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "NotificationTypeEnum" AS ENUM ('offer', 'gym_announcement', 'workout_reminder', 'hydration_reminder', 'membership_renewal');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('success', 'pending', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "RazorpayOrderStatus" AS ENUM ('created', 'attempted', 'paid', 'cancelled', 'expired');

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
CREATE TABLE "gym_amenities" (
    "gym_id" UUID NOT NULL,
    "amenity_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_amenities_pkey" PRIMARY KEY ("gym_id","amenity_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "razorpay_order_id" UUID,
    "razorpay_payment_id" VARCHAR(255),
    "razorpay_signature" VARCHAR(255),
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" VARCHAR(50),
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PaymentStatusEnum",

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "user_memberships" (
    "user_membership_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "payment_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "auto_renewal_enabled" BOOLEAN NOT NULL DEFAULT true,
    "digital_pass_code" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "plan_id" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MembershipStatusEnum" NOT NULL DEFAULT 'not_started',

    CONSTRAINT "user_memberships_pkey" PRIMARY KEY ("user_membership_id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "profile_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date_of_birth" DATE,
    "height_cm" DECIMAL(5,2),
    "weight_kg" DECIMAL(5,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "profile_picture_url" TEXT,
    "allergies" TEXT[],
    "dietary_preferences" TEXT[],
    "primary_fitness_goal" VARCHAR(100),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gender" "GenderEnum",
    "first_name" TEXT NOT NULL DEFAULT '',
    "last_name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("profile_id")
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
    "role" "UserRoleEnum" NOT NULL DEFAULT 'user',

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

-- CreateTable
CREATE TABLE "amenities" (
    "amenity_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "icon_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("amenity_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "token_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "token_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "nutrition_logs" (
    "log_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "meal_type" VARCHAR(50) NOT NULL,
    "food_name" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(7,2) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "calories" DECIMAL(7,2),
    "protein_g" DECIMAL(7,2),
    "carbs_g" DECIMAL(7,2),
    "fat_g" DECIMAL(7,2),
    "logged_date" DATE NOT NULL,
    "logged_time" TIME(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "chatbot_messages" (
    "message_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT,
    "context_data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "response_time" INTEGER,

    CONSTRAINT "chatbot_messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "razorpay_orders" (
    "order_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "razorpay_order_id" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "receipt" VARCHAR(255),
    "status" "RazorpayOrderStatus" NOT NULL DEFAULT 'created',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "razorpay_orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_payment_id_key" ON "payments"("razorpay_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_memberships_digital_pass_code_key" ON "user_memberships"("digital_pass_code");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

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
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "razorpay_orders_razorpay_order_id_key" ON "razorpay_orders"("razorpay_order_id");

-- AddForeignKey
ALTER TABLE "gym_amenities" ADD CONSTRAINT "gym_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("amenity_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_amenities" ADD CONSTRAINT "gym_amenities_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_pay_user" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_razorpay_order_id_fkey" FOREIGN KEY ("razorpay_order_id") REFERENCES "razorpay_orders"("order_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "fk_um_payment" FOREIGN KEY ("payment_id") REFERENCES "payments"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "fk_um_user" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "membership_plans"("plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "fk_profile_user" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_classes_services" ADD CONSTRAINT "gym_classes_services_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_media" ADD CONSTRAINT "gym_media_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_trial_passes" ADD CONSTRAINT "gym_trial_passes_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "membership_plans" ADD CONSTRAINT "membership_plans_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_target_gym_id_fkey" FOREIGN KEY ("target_gym_id") REFERENCES "gyms"("gym_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_entries" ADD CONSTRAINT "workout_entries_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("exercise_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_entries" ADD CONSTRAINT "workout_entries_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("workout_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_logs" ADD CONSTRAINT "nutrition_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_messages" ADD CONSTRAINT "chatbot_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "razorpay_orders" ADD CONSTRAINT "razorpay_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
