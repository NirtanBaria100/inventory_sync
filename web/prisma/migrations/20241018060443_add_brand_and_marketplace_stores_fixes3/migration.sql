/*
  Warnings:

  - You are about to drop the `brand_store` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marketplace_store` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `brand_store` DROP FOREIGN KEY `Brand_Store_marketplaceStoreId_fkey`;

-- DropTable
DROP TABLE `brand_store`;

-- DropTable
DROP TABLE `marketplace_store`;

-- CreateTable
CREATE TABLE `Store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeName` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Connection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sourceStoreId` INTEGER NOT NULL,
    `destinationStoreId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Connection` ADD CONSTRAINT `Connection_sourceStoreId_fkey` FOREIGN KEY (`sourceStoreId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
