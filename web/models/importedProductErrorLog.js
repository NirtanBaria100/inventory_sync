import prisma from "../config/db.server.js";

class ImportedProductErrorLog {
  static async CreateErrorLog(product, data, MarketPlaceStoreSession,errorMessage) {
    try {
      const marketplace = MarketPlaceStoreSession.shop; // Example: 'Amazon', 'eBay'
      const storeId = data.brandStoreId; // Assuming shop object contains the store ID
      const productId = product.id || null; // Product ID, if available
      const referenceId = data.brandStoreId || null; // Reference ID, if available

      // Save the error log in the database (using Prisma as an example)
      const log = await prisma.importedProductErrorLog.create({
        data: {
          createdDate: new Date(),
          errorMessage,
          marketplace,
          productId,
          referenceId,
          store: { connect: { id: storeId } }, // Assuming storeId exists in Store table
        },
      });
      
      return log;
    } catch (error) {
      throw new Error(
        "Failed to create error log in the database: " + error.message
      );
    }
  }
}

export default ImportedProductErrorLog;
