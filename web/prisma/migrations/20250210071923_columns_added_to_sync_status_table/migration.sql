-- AlterTable
ALTER TABLE `syncstatus` ADD COLUMN `RemainingMarketPlaces` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `TotalMarketPlaces` INTEGER NOT NULL DEFAULT 0;
