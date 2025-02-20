/*
  Warnings:

  - You are about to drop the column `MetaData` on the `importedproductlog` table. All the data in the column will be lost.
  - You are about to drop the column `ProductReferences` on the `importedproductlog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `importedproductlog` DROP COLUMN `MetaData`,
    DROP COLUMN `ProductReferences`;

-- CreateTable
CREATE TABLE `ImportedProductReferences` (
    `Refid` INTEGER NOT NULL,
    `Marketplace` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `importedProductLogLogID` INTEGER NULL,

    PRIMARY KEY (`Refid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImportedProductReferences` ADD CONSTRAINT `ImportedProductReferences_importedProductLogLogID_fkey` FOREIGN KEY (`importedProductLogLogID`) REFERENCES `ImportedProductLog`(`LogID`) ON DELETE SET NULL ON UPDATE CASCADE;
