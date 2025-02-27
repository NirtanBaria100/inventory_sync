-- AlterTable
ALTER TABLE `session` ADD COLUMN `accountOwner` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `collaborator` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `emailVerified` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `locale` VARCHAR(191) NULL;
