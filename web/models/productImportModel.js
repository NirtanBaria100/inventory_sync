import logger from "../config/logger.js";
import { producerQueueBulk } from "../jobs/importJob.js";
import prisma from "../config/db.server.js";
import { findConnectedDestinationStores } from "./connectionModel.js";
import ProductCollectionModel from "./collectioModel.js";
import { GetSessionByShopName } from "./dbSessionModel.js";
import { fetchProductByIdQuery } from "../graphql/queries.js";
import axios from "axios";

class productImportModel {
  static async importProductToMarketPlace(product, shop, collectionIds) {
    // await producerQueueBulk(marketplaces, products);
    // return { successMessage: "Products has been imported" };
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

      let BrandStoreSession = await GetSessionByShopName(shop.ShopName);

      if (!BrandStoreSession) {
        logger.error(
          `Session does not found for shop: ${BrandStoreSession.shop}`
        );
      }

      logger.info(
        "Brand store session: " + JSON.stringify({ BrandStoreSession })
      );
      // Check if the collection already exists

      //To fetch the further details for the product we call graphql api
      const productDetails = await this.findProductById(
        product.ProductId,
        BrandStoreSession
      );

      //Fetch the marketplace session from db
      let MarketPlaceStoreSession = await GetSessionByShopName(shop.ShopName);

      if (!MarketPlaceStoreSession) {
        logger.error(
          `Session does not found for shop: ${MarketPlaceStoreSession.shop}`
        );
      }

      let collections = productDetails?.collections?.nodes;

      logger.info(
        `collections for this product ${product.ProductId}:` +
          JSON.stringify(collections)
      );

      let collectionIds = [];

      for (const collection of collections) {
        try {
          let collectionAlreadyExist =
            await ProductCollectionModel.checkExistingShopifyCollection(
              collection.title,
              MarketPlaceStoreSession
            );

          if (!collectionAlreadyExist) {
            const collectionData =
              await ProductCollectionModel.CreateCollectionShopify(
                collection.title,
                MarketPlaceStoreSession
              );

            collectionIds.push(collectionData);
          } else {
            collectionIds.push(collectionAlreadyExist.id);
          }
        } catch (error) {
          console.error(
            `Error creating collection for ${collection.title}:`,
            error
          );
        }
      }

      // console.log({ collectionIds });

      await this.importProductToMarketPlace(product, shop, collectionIds);


    } catch (error) {
      logger.error(error.message);
    }
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
      console.log({ session, productId });

      // Validate productId
      if (!productId.startsWith("gid://shopify/Product/")) {
        throw new Error("Invalid product ID format.");
      }

      // Validate session
      if (!session?.shop || !session?.accessToken) {
        throw new Error("Invalid session or missing authentication details.");
      }

      // GraphQL query
      const query = `
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
            vendor
            variants(first: 10) {
              nodes {
                id
                title
                price
              }
            }
            collections(first: 10) {
              nodes {
                id
                title
              }
            }
          }
        }
      `;

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

      console.log({ product });
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

  
}

export default productImportModel;
