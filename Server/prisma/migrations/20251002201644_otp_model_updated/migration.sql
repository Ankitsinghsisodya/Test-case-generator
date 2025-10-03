/*
  Warnings:

  - Added the required column `name` to the `otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "otp" ADD COLUMN     "name" TEXT NOT NULL;
