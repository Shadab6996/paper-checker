/*
  Warnings:

  - Made the column `endTime` on table `Test` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startTime` on table `Test` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Test" ALTER COLUMN "endTime" SET NOT NULL,
ALTER COLUMN "startTime" SET NOT NULL;
