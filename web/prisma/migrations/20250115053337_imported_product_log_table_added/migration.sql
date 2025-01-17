-- CreateTable
CREATE TABLE `ImportedProductLog` (
    `LogID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProductId` INTEGER NOT NULL,
    `ProductName` VARCHAR(50) NOT NULL,
    `Vendor` VARCHAR(50) NOT NULL,
    `ImportDate` DATETIME(3) NULL,
    `Status` VARCHAR(50) NULL,
    `MetaData` JSON NULL,

    PRIMARY KEY (`LogID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
