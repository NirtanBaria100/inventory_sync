-- CreateTable
CREATE TABLE `marketplaceStore` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brandStore` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `marketplaceStoreId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `brandStore` ADD CONSTRAINT `brandStore_marketplaceStoreId_fkey` FOREIGN KEY (`marketplaceStoreId`) REFERENCES `marketplaceStore`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
