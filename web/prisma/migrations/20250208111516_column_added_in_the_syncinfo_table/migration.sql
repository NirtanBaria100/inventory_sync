/*
  Warnings:

  - You are about to drop the column `model` on the `syncstatus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `syncstatus` DROP COLUMN `model`,
    ADD COLUMN `mode` VARCHAR(191) NOT NULL DEFAULT '';
