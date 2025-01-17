import logger from "../config/logger.js";
import { producerQueueBulk } from "../jobs/importJob.js";
import prisma from "../config/db.server.js";

class productImportModel {
  static async importProductToMarketPlace(products, marketplaces) {
    // await producerQueueBulk(marketplaces, products);
    // return { successMessage: "Products has been imported" };
  }

  static async createProductToMarketPlace(product, brandStoreName) {
    // Check if the product exists in Marketplace by 'tag' metafield
    // const existingProduct = await checkIfProductAlreadyExistOnMarketPlace(shop);
    // console.log({ existingProduct });

    // if (existingProduct) {
    // If product exists, update it
    // console.log(`Updating product with WooCommerce ID: ${product.id}`);
    // await updateProductInShopify(
    //   existingProduct,
    //   product,
    //   admin,
    //   collectionId,
    //   session
    // );
    // } else {
    //   // If product does not exist, create it
    //   console.log(`Importing new product with WooCommerce ID: ${product.id}`);

    //find connected marketplace with the brand store

    let connectedStores = await 

    // Fetch marketplace session from Db by shopName
    let session = await GetSessionByShopName(brandStoreName);

    // Check if the collection already exists

    const collectionId = await CreateCollectionShopify(
      admin,
      pdtCategory[0].name
    );

    await this.importProductToMarketPlace(product, shop, collectionId);
    // }
  }

  static async createImportedProductLog(shop, products) {
    // Validate input data
    if (!products) {
      return { message: "Invalid product data provided" };
    }

    // Prepare data for insertion
    const insertedData = products.map((product) => ({
      ProductId: product.id,
      Vendor: product.vendor,
      ProductName: product.title,
      ShopName: shop,
      ImportDate: new Date(), // Add current timestamp
      MetaData: product.MetaData || {}, // Use empty object as default
    }));

    try {
      // Create a new imported product log
      const createdLogs = await prisma.importedProductLog.createMany({
        data: insertedData,
      });

      // Return success response
      return {
        message: "Imported product log created successfully",
        data: createdLogs,
      };
    } catch (error) {
      // Log and throw error for better error handling
      console.log(error);
      logger.error("Error creating imported product log:", error);
      throw new Error(
        "An error occurred while creating the imported product log",
        error
      );
    }
  }

  static async findProductFromImportLogs(shop, productId) {
    try {
      let where = {};

      if (productId != null) {
        where.productId = productId;
      }

      where.ShopName = shop;

      let productLog = await prisma.importedProductLog.findFirst({
        where: where,
      });

      if (!productLog) {
        return {
          message: "This product is not synced",
          data: null,
        };
      }
      return {
        message:
          "Product has been retrived successfully And product is already synced",
        data: productLog,
      };
    } catch (error) {
      console.log(error);
      // Log and throw error for better error handling
      logger.error("Error finding imported product log:", {
        error: error.messsage,
      });
      throw new Error(error.messsage);
    }
  }
  static async findProductsFromImportLogs(shop) {
    try {
      let where = {};
      where.ShopName = shop;

      let productLog = await prisma.importedProductLog.findMany({
        where: where,
      });

      if (!productLog) {
        return {
          message: "This product is not synced",
          data: null,
        };
      }
      return {
        message:
          "Product has been retrived successfully And product is already synced",
        data: productLog,
      };
    } catch (error) {
      console.log(error);
      // Log and throw error for better error handling
      logger.error("Error finding imported product log:", {
        error: error.messsage,
      });
      throw new Error(error.messsage);
    }
  }

  importProductToMarketPlace() {}
}

export default productImportModel;
