-- DropForeignKey
ALTER TABLE `importedproductreferences` DROP FOREIGN KEY `ImportedProductReferences_importedProductLogLogID_fkey`;

-- AddForeignKey
ALTER TABLE `ImportedProductReferences` ADD CONSTRAINT `ImportedProductReferences_importedProductLogLogID_fkey` FOREIGN KEY (`importedProductLogLogID`) REFERENCES `ImportedProductLog`(`LogID`) ON DELETE CASCADE ON UPDATE CASCADE;
