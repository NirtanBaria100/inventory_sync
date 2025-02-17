import prisma from "../config/db.server.js";
import logger from "../config/logger.js";
class ImportedProductsLogsModel {
  static async UpdateStatus(
    value,
    product_id,
    createdProduct,
    MarketPlaceStoreSession,
    shop
  ) {
    try {
      let ProductReferences = [];

      let Logs = await prisma.importedProductLog.findFirst({
        where: { ProductId: product_id, ShopName: shop.ShopName },
        select: { ProductReferences: true },
      });

      // Properly concatenating existing references
      ProductReferences = [
        ...ProductReferences,
        ...(Logs?.ProductReferences || []),
      ];

      console.log({ ProductReferences });

      ProductReferences.push({
        id: createdProduct.id,
        marketplace: MarketPlaceStoreSession.shop,
      });

      await prisma.importedProductLog.update({
        where: { ProductId: product_id },
        data: {
          Status: value,
          ProductReferences: ProductReferences,
        },
      });

      logger.info("Logs have been created for imported product!");
    } catch (error) {
      logger.info("Error while creating logs for imported products:", error);
      throw new Error(error);
    }
  }

  static async findManyLogs(ids, shop) {
    return await prisma.importedProductLog.findMany({
      where: {
        ProductId: {
          in: ids,
        },
        ShopName: shop,
      },
      select: { ProductReferences: true, ProductId: true },
    });
  }
  static async findLog(id, shop) {
    return await prisma.importedProductLog.findFirst({
      where: {
        ProductId: id,
        ShopName: shop,
      },
      select: { ProductReferences: true, ProductId: true },
    });
  }
  static async getImportedProductLogsDateWise(CreateAt, UpdatedAt) {
    return await prisma.importedProductLog.findMany({
      where: {
        ImportDate: {
          gte: new Date(CreateAt).toISOString(), // Convert back to Date object
          lte: new Date(UpdatedAt).toISOString(), // Convert back to Date object
        },
      },
    });
  }

  static async deleteMany(id, brand) {
    await prisma.importedProductLog.delete({
      where: {
        ProductId: id,
        ShopName: brand,
      },
    });
  }
}

export default ImportedProductsLogsModel;
