-- AddForeignKey
ALTER TABLE `Connection` ADD CONSTRAINT `Connection_destinationStoreId_fkey` FOREIGN KEY (`destinationStoreId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
