-- CreateTable
CREATE TABLE `syncStatus` (
    `Shop` VARCHAR(191) NOT NULL,
    `Total` INTEGER NOT NULL,
    `Remaining` INTEGER NOT NULL,
    `UpdatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`Shop`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
