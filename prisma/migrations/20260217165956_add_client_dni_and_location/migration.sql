/*
  Warnings:

  - Added the required column `client_dni` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "client_dni" TEXT NOT NULL,
ADD COLUMN     "client_location" TEXT;
