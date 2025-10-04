/*
  Warnings:

  - You are about to drop the column `planType` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "planType",
ALTER COLUMN "razorpayOrderId" DROP NOT NULL;

-- DropEnum
DROP TYPE "public"."PlanType";
