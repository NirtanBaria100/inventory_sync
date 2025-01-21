-- CreateTable
CREATE TABLE `ImportedProductErrorLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `errorMessage` VARCHAR(191) NOT NULL,
    `marketplace` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `storeId` INTEGER NOT NULL,

    INDEX `ImportedProductErrorLog_storeId_idx`(`storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImportedProductErrorLog` ADD CONSTRAINT `ImportedProductErrorLog_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
