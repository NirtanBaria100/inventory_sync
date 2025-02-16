import { DeliveryMethod } from "@shopify/shopify-api";
import { GetSessionByShopName } from "./models/dbSessionModel.js";
import logger from "./config/logger.js";
import {
  findConnectedDestinationStores,
  findStoreByName,
} from "./models/connectionModel.js";
import ImportedProductsLogsModel from "./models/importedProductLog.js";
import ProductModel from "./models/productModel.js";
import productImportModel from "./models/productImportModel.js";

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },

  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      logger.info("Product Update webhook is initialized...");
      const payload = JSON.parse(body);
      let product = payload;

      //fetching the store details from table "store" to get the id
      let brandStore = await findStoreByName(shop);

      if (!brandStore) {
        logger.error("No store found with the shop:" + shop);
      }

      let connectedStores = await findConnectedDestinationStores(brandStore.id);

      if (connectedStores) {
        logger.info(
          "The marketplaces that are connected with with this brand store is: " +
            JSON.stringify({ connectedStores })
        );
      } else {
        return logger.info(
          "No marketplace connect with this brand Store: " + shop
        );
      }

      // Fetch marketplace session from Db by shopName
      let BrandStoreSession = await GetSessionByShopName(shop);
      if (!BrandStoreSession) {
        logger.error(`Session does not found for shop: ${shop}`);
      }

      //To fetch the further details for the product we call graphql api
      const productDetails = await ImportedProductsLogsModel.findLog(
        product.admin_graphql_api_id,
        BrandStoreSession.shop
      );

      if (!productDetails) {
        return logger.info("No product found to update on marketplaces");
      }

      for (const productRef of productDetails.ProductReferences) {
        //Fetch the marketplace session from db
        let MarketPlaceStoreSession = await GetSessionByShopName(
          productRef.marketplace
        );

        if (!MarketPlaceStoreSession) {
          return logger.error("Marketplace session not found!");
        }

        let productGraphqlVersionFormat =
          await productImportModel.findProductById(
            product.admin_graphql_api_id,
            BrandStoreSession
          );
        console.log({ productGraphqlVersionFormat });

        let IsProductUpdated = await ProductModel.CreateProduct(
          MarketPlaceStoreSession,
          productGraphqlVersionFormat,
          BrandStoreSession.shop,
          productRef.id
        );

        return logger.info(
          `${IsProductUpdated.id} has been successfully updated on marketplace :${productRef.marketplace}}`
        );
      }

      // console.log({ payload });
    },
  },
};
