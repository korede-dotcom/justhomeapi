/*
  Warnings:

  - You are about to drop the column `packager` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `receptionist` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `storekeeper` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_attendeeId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "packager",
DROP COLUMN "receptionist",
DROP COLUMN "storekeeper",
ADD COLUMN     "packagerId" TEXT,
ADD COLUMN     "receptionistId" TEXT,
ADD COLUMN     "storekeeperId" TEXT,
ALTER COLUMN "attendeeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_receptionistId_fkey" FOREIGN KEY ("receptionistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_packagerId_fkey" FOREIGN KEY ("packagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storekeeperId_fkey" FOREIGN KEY ("storekeeperId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
