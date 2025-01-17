/*
  Warnings:

  - Added the required column `ShopName` to the `ImportedProductLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `importedproductlog` ADD COLUMN `ShopName` VARCHAR(50) NOT NULL;
