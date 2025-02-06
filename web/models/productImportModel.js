import logger from "../config/logger.js";
import prisma from "../config/db.server.js";
import { findConnectedDestinationStores } from "./connectionModel.js";
import { GetSessionByShopName } from "./dbSessionModel.js";
import axios from "axios";
import ProductModel from "./productModel.js";
import ImportedProductErrorLog from "./ImportedProductErrorLog.js";
import { getProductQuery } from "../graphql/queries.js";
import ImportedProductsLogsModel from "./importedProductLog.js";
import { getRemaining, syncInfoUpdate } from "./syncInfoModel.js";
import { SHOULD_AUTOBATCH } from "@reduxjs/toolkit";
import { jobStates } from "../utils/jobStates.js";

class productImportModel {
  static async importProductToMarketPlace(
    product,
    shop,
    MarketPlaceStoreSession
  ) {
    //Create product on marketplace.
    try {

      let createdProduct = await ProductModel.CreateProduct(
        MarketPlaceStoreSession,
        product,
        shop
      );

      logger.info(
        `${createdProduct.id} Product has been imported Successfully! 🍸`
      );

      //Update the sync Status of imported product to datbase

      try {
        await ImportedProductsLogsModel.UpdateStatus(
          true,
          product.id,
          createdProduct,
          MarketPlaceStoreSession,
          shop
        );

        
        let syncStatus = await getRemaining(shop);

        let afterUpdate = await syncInfoUpdate(
          shop.shop,
          syncStatus.Total,
          syncStatus.Remaining + 1,
          jobStates.Inprogress,
          product.id
        );



        if (afterUpdate.Remaining == syncStatus.Total) {
          await syncInfoUpdate(shop.shop, syncStatus.Total, syncStatus.Total, jobStates.Finish,"");
        }

        logger.info(
          "Product sync status updated at ImportedProductsLogs table in database Product id:" +
            product.id
        );

      } catch (error) {
        logger.error("Error while creating products:",error);
      }

      //Creates tags for the product
      //I have decided to add tags seperatly using addTags api because If a included tags in the product create api so it will
      //overwrite the existing tags which is not required.
      // try {
      //   let AddTags = await ProductModel.CreateTags(
      //     MarketPlaceStoreSession,
      //     createdProduct,
      //     shop
      //   );

      //   if (AddTags) {
      //     logger.info(
      //       "Product tags has been created for Product:" + createdProduct.id
      //     );
      //   }
      // } catch (error) {
      //   logger.error(error);
      // }

      // //Creates variants for the product
      // try {
      //   let AddVariants = await ProductModel.CreateVariants(
      //     MarketPlaceStoreSession,
      //     createdProduct,
      //     product,
      //     shop
      //   );

      //   if (AddVariants) {
      //     logger.info(
      //       "Product variants has been created for Product:" + createdProduct.id
      //     );
      //   }

      // } catch (error) {
      //   logger.error(error);
      // }
    } catch (error) {
      let errorMessage =
        "Error while importing Product to marketPlace: " + error.message;

      logger.error(errorMessage);

      //maintain a log history if a product could not imported properly
      try {
        let createlogs = await ImportedProductErrorLog.CreateErrorLog(
          product,
          shop,
          MarketPlaceStoreSession,
          errorMessage
        );

        //Error logs table has the folllowing fields
        //id, created_date, error_message, marketplace where it was importing product,  product_id and reference id of the brandstore and it will be connected with Store table

        logger.error(
          "Error while importing Product to marketPlace: Product id: " +
            product.id +
            " " +
            error.message
        );
      } catch (error) {
        logger.error(
          "Error while creating Error logs in database:" + error.message
        );
      }
    }
  }

  static async createProductToMarketPlace(product, shop) {
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

    try {
      //find connected marketplace with the brand store
      let connectedStores = await findConnectedDestinationStores(
        shop.brandStoreId
      );

      logger.info(
        "The marketplaces that are connected with with this brand store is: " +
          JSON.stringify({ connectedStores })
      );

      // Fetch marketplace session from Db by shopName

      let BrandStoreSession = await GetSessionByShopName(shop.shop);

      if (!BrandStoreSession) {
        logger.error(
          `Session does not found for shop: ${BrandStoreSession.shop}`
        );
      }

      logger.info("Brand store session: " + BrandStoreSession.id);
      // Check if the collection already exists

      //To fetch the further details for the product we call graphql api
      const productDetails = await this.findProductById(
        product.ProductId,
        BrandStoreSession
      );

      //Fetch the marketplace session from db
      let MarketPlaceStoreSession = await GetSessionByShopName(
        connectedStores.destinationStore.storeName
      );

      if (!MarketPlaceStoreSession) {
        logger.error(
          `Session does not found for shop: ${MarketPlaceStoreSession.shop}`
        );
      }

      await this.importProductToMarketPlace(
        productDetails,
        shop,
        MarketPlaceStoreSession
      );
    } catch (error) {
      logger.error(error.message);
    }
    // }
  }

  static async createImportedProductLog(shop, products) {
    // Validate input data
    if (!products.length > 0) {
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
        skipDuplicates: true,
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
        where.ProductId = productId;
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
      logger.error(
        "Error finding imported product log:" +
          {
            error: error.messsage,
          }
      );
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
      logger.error(
        "Error finding imported product log:" +
          {
            error: error.messsage,
          }
      );
      throw new Error(error.messsage);
    }
  }

  static async findProductById(productId, session) {
    try {
      // Validate productId
      if (!productId.startsWith("gid://shopify/Product/")) {
        throw new Error("Invalid product ID format.");
      }

      // Validate session
      if (!session?.shop || !session?.accessToken) {
        throw new Error("Invalid session or missing authentication details.");
      }

      // GraphQL query
      const query = getProductQuery;

      // GraphQL variables
      const variables = { id: productId };

      // GraphQL endpoint
      const graphqlEndpoint = `https://${session.shop}/admin/api/2025-01/graphql.json`;

      // Set headers
      const headers = {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      };

      // Make the API call
      const response = await axios.post(
        graphqlEndpoint,
        { query, variables },
        { headers }
      );

      // Extract the product data
      const product = response.data?.data?.product;

      if (!product) {
        throw new Error("Product not found.");
      }

      return product;
    } catch (error) {
      if (error.response) {
        console.error(
          "Shopify API Error:",
          JSON.stringify(error.response.data)
        );
      } else {
        console.error("Error fetching product:", error.message);
      }
      throw new Error(`Failed to fetch product. ${error.message}`);
    }
  }

  static async deleteProductToMarketPlace(productsIds, shop, marketPlaces) {
    logger.info("Product delete Process Started!👌" + shop);

    try {
      let importedProductLogs = await ImportedProductsLogsModel.findManyLogs(
        productsIds,
        shop
      );

      if (!importedProductLogs || importedProductLogs.length === 0) {
        logger.error("No Products found to be deleted for Brand:" + shop);
        return;
      }

      let ProductMetadata = [];
      for (const log of importedProductLogs) {
        for (const ProductReference of log.ProductReferences) {
          if (ProductReference.marketplace) {
            const Session = await GetSessionByShopName(
              ProductReference.marketplace
            );
            if (Session) {
              ProductMetadata.push({
                marketPlace: ProductReference.marketplace,
                refId: ProductReference.id,
                accessToken: Session.accessToken,
                Id: log.ProductId,
              });
            }
          } else {
            logger.error(
              `Invalid marketplace: ${ProductReference.marketplace} in ProductReference`
            );
          }
        }
      }

      const uniqueMarketplaces = [
        ...new Map(
          ProductMetadata.map((item) => [
            item.marketPlace,
            { marketPlace: item.marketPlace, accessToken: item.accessToken },
          ])
        ).values(),
      ];

      const marketPlaces = uniqueMarketplaces;

      for (const marketPlace of marketPlaces) {
        //fetch products for this marketplace
        let FilteredProductsByMarketPlace = ProductMetadata.filter(
          (product) => product.marketPlace == marketPlace.marketPlace
        );

        //map product idss
        let mapFilteredProducts = FilteredProductsByMarketPlace.map(
          (product) => ({ refId: product.refId, id: product.Id })
        );

        await ProductModel.deleteProductsBulk(mapFilteredProducts, marketPlace);
      }
    } catch (error) {
      console.log(error);
      logger.error(error);
    }
  }
}

export default productImportModel;
