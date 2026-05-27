-- AlterTable
ALTER TABLE "ResidentApartment" ADD COLUMN "owner_type" TEXT NOT NULL DEFAULT 'קיבוץ';
ALTER TABLE "ResidentApartment" ADD COLUMN "allocation_status" TEXT NOT NULL DEFAULT 'לא משויך';
