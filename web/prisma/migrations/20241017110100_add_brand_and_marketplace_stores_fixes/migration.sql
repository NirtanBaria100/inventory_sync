-- DropForeignKey
ALTER TABLE `brandstore` DROP FOREIGN KEY `brandStore_marketplaceStoreId_fkey`;

-- AddForeignKey
ALTER TABLE `BrandStore` ADD CONSTRAINT `BrandStore_marketplaceStoreId_fkey` FOREIGN KEY (`marketplaceStoreId`) REFERENCES `MarketplaceStore`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
