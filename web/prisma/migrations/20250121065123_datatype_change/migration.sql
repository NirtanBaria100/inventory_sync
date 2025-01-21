/*
  Warnings:

  - You are about to alter the column `referenceId` on the `importedproducterrorlog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `importedproducterrorlog` MODIFY `referenceId` INTEGER NULL;
