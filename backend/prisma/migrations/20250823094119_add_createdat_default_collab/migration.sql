/*
  Warnings:

  - You are about to drop the column `s3Url` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Collaboration" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "s3Url";
