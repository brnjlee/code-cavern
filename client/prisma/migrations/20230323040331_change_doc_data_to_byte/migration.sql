/*
  Warnings:

  - The `data` column on the `DocumentData` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DocumentData" DROP COLUMN "data",
ADD COLUMN     "data" BYTEA;
