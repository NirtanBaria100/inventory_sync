/*
  Warnings:

  - You are about to drop the `brandstore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marketplacestore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `brandstore` DROP FOREIGN KEY `BrandStore_marketplaceStoreId_fkey`;

-- DropTable
DROP TABLE `brandstore`;

-- DropTable
DROP TABLE `marketplacestore`;

-- CreateTable
CREATE TABLE `Marketplace_Store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Brand_Store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `marketplaceStoreId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Brand_Store` ADD CONSTRAINT `Brand_Store_marketplaceStoreId_fkey` FOREIGN KEY (`marketplaceStoreId`) REFERENCES `Marketplace_Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
