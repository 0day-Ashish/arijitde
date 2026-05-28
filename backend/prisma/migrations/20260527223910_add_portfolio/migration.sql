/*
  Warnings:

  - Added the required column `uploadType` to the `Portfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('EXCEL', 'MANUAL');

-- CreateEnum
CREATE TYPE "FundType" AS ENUM ('SIP', 'LUMPSUM');

-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "uploadType" "UploadType" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PortfolioRow" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "fundName" TEXT NOT NULL,
    "type" "FundType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "sipAmount" DOUBLE PRECISION NOT NULL,
    "invested" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PortfolioRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLResult" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,

    CONSTRAINT "MLResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Score_portfolioId_key" ON "Score"("portfolioId");

-- CreateIndex
CREATE UNIQUE INDEX "MLResult_portfolioId_key" ON "MLResult"("portfolioId");

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioRow" ADD CONSTRAINT "PortfolioRow_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MLResult" ADD CONSTRAINT "MLResult_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
