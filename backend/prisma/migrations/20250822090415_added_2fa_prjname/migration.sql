/*
  Warnings:

  - You are about to drop the column `projectJson` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `EmailVerificationToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenHash]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,deviceId]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."EmailVerificationToken" DROP CONSTRAINT "EmailVerificationToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropIndex
DROP INDEX "public"."RefreshToken_deviceId_key";

-- DropIndex
DROP INDEX "public"."RefreshToken_userId_key";

-- AlterTable
ALTER TABLE "public"."EmailVerificationToken" ALTER COLUMN "deviceId" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "projectJson",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "s3Url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."TwoFaChallenge" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "secret" TEXT,
    "codeHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "TwoFaChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwoFaChallenge_tokenHash_key" ON "public"."TwoFaChallenge"("tokenHash");

-- CreateIndex
CREATE INDEX "TwoFaChallenge_userId_idx" ON "public"."TwoFaChallenge"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "public"."EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_deviceId_key" ON "public"."RefreshToken"("userId", "deviceId");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TwoFaChallenge" ADD CONSTRAINT "TwoFaChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
