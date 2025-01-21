import axios from "axios";
import logger from "../config/logger.js";
import { addTagsMutation } from "../graphql/mutations.js";

class ProductModel {
  static async CreateProduct(MarketPlaceStoreSession, product, shop) {
    try {
      console.log({ product });
      // Shopify GraphQL endpoint
      const shopifyEndpoint = `https://${MarketPlaceStoreSession.shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
      console.log({
        shopifyEndpoint,
        accessToken: MarketPlaceStoreSession.accessToken,
      });

      // Shopify GraphQL mutation for creating a product
      const mutation = `
            mutation createProduct($input: ProductInput!) {
              productCreate(input: $input) {
                product {
                  id
                  title
                  handle
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        sku
                        price
                      }
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;

      let productOptionsMap = product.options.map((option) => ({
        name: option.name,
        position: option.position,
        values: option.optionValues?.map((optionvalue) => ({
          name: optionvalue.name,
        })),
      }));

      // Map your product fields to Shopify's product schema
      const variables = {
        input: {
          title: product.title,
          descriptionHtml: product.descriptionHtml,
          productOptions: productOptionsMap,
        },
      };

      // Make the API request to Shopify
      const response = await axios.post(
        shopifyEndpoint,
        {
          query: mutation,
          variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": MarketPlaceStoreSession.accessToken,
          },
        }
      );

      // Handle the response
      const data = response.data;

      // Check for errors
      if (data.errors) {
        throw new Error(
          `GraphQL errors: ${data.errors.map((e) => e.message).join(", ")}`
        );
      }

      const productData = data.data.productCreate;
      if (productData.userErrors.length > 0) {
        throw new Error(
          `User errors: ${productData.userErrors
            .map((e) => e.message)
            .join(", ")}`
        );
      }

      // Return the created product details
      return productData.product;
    } catch (error) {
      throw new Error("Failed to create product in Shopify: " + error.message);
    }
  }

  static async CreateTags(MarketPlaceStoreSession, product, shop) {
    try {
      const appName = process.env.APP_NAME;
      // Shopify GraphQL endpoint
      const shopifyEndpoint = `https://${MarketPlaceStoreSession.shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

      // GraphQL mutation to add tags
      const mutation = addTagsMutation;

      // Variables for the mutation
      const variables = {
        id: product.id, // Shopify product ID, must be in the format gid://shopify/Product/123456789
        tags: [shop.shop, appName] || [], // Tags to be added
      };

      // Make the API request
      const response = await axios.post(
        shopifyEndpoint,
        {
          query: mutation,
          variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": MarketPlaceStoreSession.accessToken,
          },
        }
      );

      // Process the response
      const data = response.data;

      if (data.errors) {
        throw new Error(
          `GraphQL errors: ${data.errors.map((e) => e.message).join(", ")}`
        );
      }

      const tagsAddResult = data.data.tagsAdd;

      if (tagsAddResult.userErrors.length > 0) {
        throw new Error(
          `User errors: ${tagsAddResult.userErrors
            .map((e) => e.message)
            .join(", ")}`
        );
      }

      // Successfully added tags
      logger.info("tags are created for product:" + product.id);
      return tagsAddResult.node;
    } catch (error) {
      throw new Error(
        `Failed to add tags to the product in Shopify: ${error.message}`
      );
    }
  }

  static async CreateVariants(MarketPlaceStoreSession, product, shop) {}
}

export default ProductModel;
