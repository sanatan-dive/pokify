/*
  Warnings:

  - You are about to drop the column `alienDescription` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `alienName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `alienPower` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `alienTitle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `alienType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `followers` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pfpUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `posts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[walletAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `walletAddress` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "alienDescription",
DROP COLUMN "alienName",
DROP COLUMN "alienPower",
DROP COLUMN "alienTitle",
DROP COLUMN "alienType",
DROP COLUMN "followers",
DROP COLUMN "image",
DROP COLUMN "pfpUrl",
DROP COLUMN "posts",
DROP COLUMN "username",
ADD COLUMN     "chain" TEXT NOT NULL DEFAULT 'base',
ADD COLUMN     "nativeBalanceUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "nftCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "powerScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resolvedName" TEXT,
ADD COLUMN     "tokenValueUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "txCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "walletAddress" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Creature" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "wisdom" INTEGER NOT NULL,
    "luck" INTEGER NOT NULL,
    "flavorText" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "onChainTokenId" TEXT,
    "mintedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Creature_userId_idx" ON "Creature"("userId");

-- CreateIndex
CREATE INDEX "Creature_rarity_idx" ON "Creature"("rarity");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_powerScore_idx" ON "User"("powerScore");

-- AddForeignKey
ALTER TABLE "Creature" ADD CONSTRAINT "Creature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
