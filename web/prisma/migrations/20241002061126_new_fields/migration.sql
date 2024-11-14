/*
  Warnings:

  - You are about to alter the column `collaborator` on the `session` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.
  - Made the column `accountOwner` on table `session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `session` MODIFY `accountOwner` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `collaborator` BOOLEAN NULL DEFAULT false;
