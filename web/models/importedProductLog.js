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

      // let Logs = await prisma.importedProductLog.findFirst({
      //   where: { ProductId: product_id, ShopName: shop.ShopName },
      //   select: { ProductReferences: true },
      // });

      // if (Logs.ProductReferences) {
      //   ProductReferences.push(Logs.ProductReferences);
      // }

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
      logger.info("Logs has been created for imported product!");
    } catch (error) {
      logger.info("Error while creating logs for imported products:".error);
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

  static async getImportedProductLogsDateWise(CreateAt, UpdatedAt) {
    const fromDate = new Date(CreateAt);
    const toDate = new Date(UpdatedAt); // Next second for range
    
    console.log({fromDate,toDate});
    return await prisma.importedProductLog.findMany({
      where: { ImportDate: { gte: fromDate, lte: toDate, } },
    });
  }


}

export default ImportedProductsLogsModel;
