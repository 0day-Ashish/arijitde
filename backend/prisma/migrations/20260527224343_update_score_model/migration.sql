/*
  Warnings:

  - Added the required column `assetAlloc` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discipline` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diversification` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `efficiency` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goalAlignment` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insights` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ScoreTag" AS ENUM ('ALIGNED', 'MODERATE', 'NEEDS_REVIEW', 'NEEDS_STRUCTURING');

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "assetAlloc" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discipline" INTEGER NOT NULL,
ADD COLUMN     "diversification" INTEGER NOT NULL,
ADD COLUMN     "efficiency" INTEGER NOT NULL,
ADD COLUMN     "goalAlignment" INTEGER NOT NULL,
ADD COLUMN     "insights" JSONB NOT NULL,
ADD COLUMN     "tag" "ScoreTag" NOT NULL,
ADD COLUMN     "total" INTEGER NOT NULL;
