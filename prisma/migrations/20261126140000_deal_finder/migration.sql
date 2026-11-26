-- CreateEnum
CREATE TYPE "OfferCategory" AS ENUM ('STAY', 'ACTIVITY', 'TRANSPORT', 'DINING', 'NIGHTLIFE', 'OTHER');

-- CreateEnum
CREATE TYPE "PriceUnit" AS ENUM ('PER_PERSON', 'PER_NIGHT', 'PER_GROUP');

-- CreateEnum
CREATE TYPE "PickStatus" AS ENUM ('SUGGESTED', 'BOOKED');

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "partner" TEXT NOT NULL,
    "category" "OfferCategory" NOT NULL,
    "location" TEXT NOT NULL,
    "priceKes" INTEGER NOT NULL,
    "unit" "PriceUnit" NOT NULL DEFAULT 'PER_PERSON',
    "maxGuests" INTEGER,
    "tags" TEXT[],
    "commissionPct" INTEGER NOT NULL DEFAULT 0,
    "bookingUrl" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferPick" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "status" "PickStatus" NOT NULL DEFAULT 'BOOKED',
    "amountKes" INTEGER NOT NULL,
    "commissionKes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferPick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_category_active_idx" ON "Offer"("category", "active");

-- CreateIndex
CREATE UNIQUE INDEX "OfferPick_enquiryId_offerId_key" ON "OfferPick"("enquiryId", "offerId");

-- AddForeignKey
ALTER TABLE "OfferPick" ADD CONSTRAINT "OfferPick_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferPick" ADD CONSTRAINT "OfferPick_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
