import axios from "axios";
import logger from "../config/logger.js";
import {
  fetchProductByIdQuery,
  FetchProductQuery,
  fetchVendorsQuery,
} from "../graphql/queries.js";
import productImportModel from "../models/productImportModel.js";
import { producerQueue } from "../jobs/importJob.js";
import { UnSyncProducerQueue } from "../jobs/ProdcutUnsyncJob.js";
import { getSyncInfo, syncInfoCreate } from "../models/syncInfoModel.js";
import { jobStates } from "../utils/jobStates.js";

class productController {
  static async getProductBatch(req, res) {
    try {
      const { accessToken, shop } = res.locals.shopify.session;
      logger.info("Incoming request", { body: req.body });

      const { searchQuery, FilterCriteria, endCursor, startCursor, event } =
        req.body;

      // const allProducts = [];
      let limit = 250;

      const graphqlEndpoint = `https://${shop}/admin/api/2025-01/graphql.json`;

      let filterQuery = "";
      logger.debug(
        "FilterCriteria and searchQuery" +
          JSON.stringify({
            FilterCriteria,
            searchQuery,
          })
      );

      if (FilterCriteria !== "") filterQuery = `vendor:${FilterCriteria}`;
      if (searchQuery !== "") filterQuery = `title: like ${searchQuery}`;
      if (searchQuery !== "" && FilterCriteria !== "")
        filterQuery = `title:${searchQuery} AND vendor:${FilterCriteria}`;

      const variables = {
        first: event == null ? limit : event == "onNext" ? limit : null,
        after: event == "onNext" ? endCursor : null,
        last: event == "onPrev" ? limit : null,
        before: event == "onPrev" ? startCursor : null,
      };

      if (filterQuery !== "") {
        variables.query = filterQuery;
      }

      logger.debug("GraphQL query variables", { variables });

      const headers = {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken, // Ensure Admin API Token
      };

      const response = await axios.post(
        graphqlEndpoint,
        { query: FetchProductQuery, variables },
        { headers }
      );
      const data = response.data.data.products;

      // Append fetched products to `allProducts`
      // data.edges.forEach(async ({ node }) => {
      //   let IsExistAlready = await productImportModel.findProductFromImportLogs(
      //     shop,
      //     node.id
      //   );

      //   allProducts.push({
      //     id: node.id,
      //     title: node.title,
      //     vendor: node.vendor,
      //     status: IsExistAlready?.data?.Status || false,
      //   });
      // });

      const allProducts = await Promise.all(
        data.edges.map(async ({ node }) => {
          const IsExistAlready =
            await productImportModel.findProductFromImportLogs(shop, node.id);

          return {
            id: node.id,
            title: node.title,
            vendor: node.vendor,
            status: IsExistAlready?.data?.Status || false,
          };
        })
      );

      logger.info(
        "Fetched products and page info" +
          JSON.stringify({
            products: allProducts.length,
            pageInfo: data.pageInfo,
          })
      );

      return res.status(200).json({
        data: allProducts,
        Pageinfo: data.pageInfo,
      });
    } catch (error) {
      if (error.response) {
        logger.error(
          "Error response from Shopify API" +
            JSON.stringify({
              status: error.response.status,
              data: error.response.data,
            })
        );
      } else {
        logger.error(
          "Unhandled error in getProductBatch" +
            JSON.stringify({
              message: error.message,
            })
        );
      }
      return res.status(500).json({ data: [], error: error.message });
    }
  }
  static async fetchStoreVendors(req, res) {
    try {
      logger.info("Fetching store vendors process started.");

      // Retrieve the Shopify session
      const session = res.locals.shopify.session;
      if (!session || !session.shop || !session.accessToken) {
        logger.error("Shopify session not found in request.");
        return res.status(400).json({ error: "Shopify session not found." });
      }

      logger.info("Shopify session retrieved.", { shop: session.shop });

      // Shopify GraphQL API endpoint
      const graphqlEndpoint = `https://${session.shop}/admin/api/2025-01/graphql.json`;

      let vendors = [];
      let hasNextPage = true;
      let endCursor = null;

      // Loop to handle cursor-based pagination
      while (hasNextPage) {
        // GraphQL query to fetch product vendors with pagination
        const queryString = fetchVendorsQuery;

        logger.debug("Fetching vendors batch...", { endCursor });

        try {
          // Execute the GraphQL query
          const response = await axios.post(
            graphqlEndpoint,
            {
              query: queryString,
              variables: {
                first: 240, // Shopify's maximum limit for vendors per request
                after: endCursor,
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": session.accessToken,
              },
            }
          );

          logger.info("Response received from Shopify API.");

          // Parse response
          const productVendors = response.data?.data?.productVendors || {};
          const edges = productVendors.edges || [];

          // Extract vendor nodes and append to the result list
          vendors.push(...edges.map((edge) => edge.node));

          // Update pagination variables
          hasNextPage = productVendors.pageInfo?.hasNextPage || false;
          endCursor = productVendors.pageInfo?.endCursor || null;
        } catch (apiError) {
          logger.error("Error while fetching batch from Shopify API.", {
            error: apiError.message,
          });
          throw apiError; // Let it bubble up to the catch block for handling
        }
      }

      if (vendors.length > 0) {
        logger.info("All vendors retrieved successfully.", {
          count: vendors.length,
        });
        return res.status(200).json({ vendors });
      } else {
        logger.warn("No vendors found in the Shopify store.");
        return res.status(404).json({
          message: "No vendors found. Please check your Shopify setup.",
        });
      }
    } catch (error) {
      logger.error("Error occurred while fetching store vendors.", {
        message: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        error: "An unexpected error occurred. Please try again later.",
      });
    }
  }
  static async Import_initialize(req, res) {
    const { shop } = res.locals.shopify.session;
    let { products, brandStoreId } = req.body;
    // let marketPlaces = ["abc", "xyz"];
    logger.info("Incoming request Products", { body: products });

    //lets save selected products to database that can be used while
    //importing products to marketplace upon the execution of queue of this brand store.
    try {
      let syncDetails = {
        total: products.length,
      };

      let saveProductsToDatabase =
        await productImportModel.createImportedProductLog(shop, products);

      if (!saveProductsToDatabase.data) {
        logger.info(saveProductsToDatabase.message);
        return res
          .status(500)
          .json({ message: saveProductsToDatabase.message });
      }

      logger.info(saveProductsToDatabase.message);
      let queue_response = "";
      try {
        //I am also managing the queue in database also
        await syncInfoCreate(syncDetails, shop, jobStates.Inqueue);

        //redis queue
        queue_response = await producerQueue({ shop, brandStoreId });
      } catch (error) {
        logger.error(error.message);
      }

      return res.status(200).json({ message: queue_response });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async unsyn_process_initialize(req, res) {
    try {
      const { shop } = res.locals.shopify.session;

      let { products, brandStoreId } = req.body;

      let productsIds = products.map((product) => product.id);

      try {
        await UnSyncProducerQueue({ productsIds, brandStoreId, shop });
      } catch (error) {
        logger.error(error.message);
      }
    } catch (error) {}

    return res.status(200).json("unsync process initialized ! 😂");
  }

  static async CheckSyncInfo(req, res) {
    try {
      let { shop } = res.locals.shopify.session;
      let syncInfo = await getSyncInfo(shop);
      return res
        .status(200)
        .json({ data: syncInfo, message: "Sync info retrieved successfully" });
    } catch (error) {
      logger.error("Error while getting sync infomation !", error);
      return res
        .status(500)
        .json({ data: [], message: "Internal server error!" });
    }
  }
}

export default productController;
