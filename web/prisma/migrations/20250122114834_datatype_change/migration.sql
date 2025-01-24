/*
  Warnings:

  - A unique constraint covering the columns `[ProductId]` on the table `ImportedProductLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ImportedProductLog_ProductId_key` ON `ImportedProductLog`(`ProductId`);
