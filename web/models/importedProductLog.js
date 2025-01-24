import prisma from "../config/db.server.js";

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
    } catch (error) {
      console.log(error);
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
      select: { ProductReferences: true,ProductId:true },
    });
  }
}

export default ImportedProductsLogsModel;
