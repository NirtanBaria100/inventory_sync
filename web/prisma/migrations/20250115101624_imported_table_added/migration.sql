/*
  Warnings:

  - You are about to alter the column `Status` on the `importedproductlog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `importedproductlog` MODIFY `Status` BOOLEAN NULL DEFAULT false;
