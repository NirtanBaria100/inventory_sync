import axios from "axios";
import logger from "../config/logger.js";
import {
  addTagsMutation,
  productCreateMutation,
  productsetMutation,
} from "../graphql/mutations.js";
import LocationModel from "./locationModel.js";
import prisma from "../config/db.server.js";
import { getRemaining, syncInfoUpdate } from "./syncInfoModel.js";
import { jobMode } from "../frontend/utils/jobMode.js";
import { jobStates } from "../utils/jobStates.js";

class ProductModel {
  static async CreateProduct(MarketPlaceStoreSession, product, shop) {
    try {
      const location = await LocationModel.getStoreLocation(
        MarketPlaceStoreSession
      );

      // Fetch column settings for the shop
      const columnSettings = await prisma.columnSelection.findUnique({
        where: { shop: shop.shop },
      });

      if (!columnSettings) {
        throw new Error("No column settings found for this shop.");
      }

      const enabledColumns = columnSettings; // Assuming `data` contains the boolean field selections

      const shopifyEndpoint = `https://${MarketPlaceStoreSession.shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
      const appName = process.env.APP_NAME;
      const mutation = productsetMutation;

      // Conditionally map product options
      let productOptionsMap = enabledColumns.Options
        ? product.options.map((option) => ({
            name: option.name,
            values: option.optionValues?.map((optionvalue) => ({
              name: optionvalue.name,
            })),
          }))
        : [];

      // Conditionally map media
      let productMediaMap = enabledColumns.Images
        ? product?.media?.edges.map((edge) => {
            let preview = edge?.node?.preview;
            let mediaContentType = edge?.node?.mediaContentType;
            return {
              originalSource: preview?.image?.url,
              alt: preview?.image?.altText,
              contentType: mediaContentType,
            };
          })
        : [];

      // Conditionally map variants
      let variants = enabledColumns.Variants
        ? product?.variants?.nodes.map((node) => ({
            price: enabledColumns.Price ? node.price : undefined,
            sku: enabledColumns.SKU ? node.sku : undefined,
            barcode: enabledColumns.Barcode ? node.barcode : undefined,
            tracked: enabledColumns.TrackInventory ? node.tracked : undefined,
            countryCodeOfOrigin: enabledColumns.CountryRegion
              ? node.countryCodeOfOrigin
              : undefined,
            countryHarmonizedSystemCodes: enabledColumns.HSCode
              ? node.countryHarmonizedSystemCodes
              : undefined,
            unitCost: enabledColumns.CostPerItem ? node.unitCost : undefined,
            position: enabledColumns.Position ? node.position : undefined,
            taxable: enabledColumns.Taxable ? node.taxable : undefined,
            compareAtPrice: enabledColumns.CompareAtPrice
              ? node.compareAtPrice
              : undefined,
            optionValues: enabledColumns.Options
              ? node.selectedOptions.map((selectedOption) => ({
                  optionName: selectedOption.name, // Option name
                  name: selectedOption.value, // Option value
                }))
              : [],
            inventoryItem: enabledColumns.TrackInventory
              ? {
                  measurement: {
                    weight: {
                      unit: enabledColumns.WeightUnit
                        ? node?.inventoryItem?.measurement?.weight?.unit
                        : undefined,
                      value: enabledColumns.Weight
                        ? node?.inventoryItem?.measurement?.weight?.value
                        : undefined,
                    },
                  },
                  tracked: enabledColumns.TrackInventory
                    ? node?.inventoryItem?.tracked
                    : undefined || false,
                  countryCodeOfOrigin: enabledColumns.CountryRegion
                    ? node?.countryCodeOfOrigin
                    : undefined,
                  countryHarmonizedSystemCodes: enabledColumns.HSCode
                    ? node?.countryHarmonizedSystemCodes
                    : undefined,
                  unitCost: enabledColumns?.CostPerItem
                    ? node?.unitCost
                    : undefined,
                }
              : {},
            inventoryQuantities:
              enabledColumns.InventoryLevel && location
                ? node?.inventoryItem?.inventoryLevels?.edges.flatMap((edge) =>
                    edge.node.quantities
                      .filter((quantity) => quantity.name == "available")
                      .map((quantity) => ({
                        locationId: location?.id,
                        name: quantity?.name,
                        quantity: quantity?.quantity,
                      }))
                  )
                : [],
          }))
        : [];

      // Conditionally add metafields
      let metafields = enabledColumns.Metafields
        ? [
            {
              key: "reference_id",
              value: product.id,
              type: "single_line_text_field",
            },
          ]
        : [];

      // Map product fields dynamically based on enabled columns
      const variables = {
        productSet: {
          ...(enabledColumns.Title
            ? { title: product.title }
            : { title: "Default Title" }),
          ...(enabledColumns.Description && {
            descriptionHtml: product.descriptionHtml,
          }),
          ...(enabledColumns.Options && { productOptions: productOptionsMap }),
          ...(enabledColumns.Images && { files: productMediaMap }),
          tags: [shop.shop, appName],
          ...(enabledColumns.Variants && { variants }),
          ...(enabledColumns.Metafields && { metafields }),
          vendor: enabledColumns.Vendor ? product?.vendor : undefined,
        },
      };

      // Make the API request using fetch
      const response = await fetch(shopifyEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": MarketPlaceStoreSession.accessToken,
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });

      // Parse the response
      const data = await response.json();

      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status} ${response.statusText}`
        );
      }

      // Check for GraphQL errors
      if (data.errors) {
        throw new Error(
          `GraphQL errors: ${data.errors.map((e) => e.message).join(", ")}`
        );
      }

      const productData = data.data.productSet;

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

  static async CreateVariants(
    MarketPlaceStoreSession,
    createdProduct,
    product,
    shop
  ) {
    // Map the variants
    let variants = product.variants.nodes.map((node) => ({
      price: node.price,
      compareAtPrice: node.compareAtPrice,
      optionValues: node.selectedOptions.map((selectedOption) => ({
        optionName: selectedOption.name, // Option name
        name: selectedOption.value, // Option value
      })),
    }));

    let productId = createdProduct.id;

    // GraphQL mutation
    const mutation = `
      mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants {
            id
            title
            selectedOptions {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Variables for the mutation
    const variables = {
      productId: productId,
      variants: variants,
    };

    try {
      // Call the GraphQL API with Axios
      const response = await axios.post(
        `https://${MarketPlaceStoreSession.shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`,
        {
          query: mutation,
          variables: variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": MarketPlaceStoreSession.accessToken,
          },
        }
      );

      const result = response.data;

      // Handle errors and success responses
      if (result.errors) {
        console.error("Errors occurred:", result.errors);
      } else if (
        result.data.productVariantsBulkCreate &&
        result.data.productVariantsBulkCreate.userErrors.length > 0
      ) {
        console.error(
          "User Errors:",
          result.data.productVariantsBulkCreate.userErrors
        );
      } else {
        console.log(
          "Variants Created:",
          result.data.productVariantsBulkCreate.productVariants
        );
      }
    } catch (error) {
      console.error("Error creating variants:", error);
    }
  }

  static async deleteProductsBulk(products, marketPlace, shop) {
    const shopifyEndpoint = `https://${marketPlace.marketPlace}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

    const mutation = `
      mutation productDelete($id: ID!) {
        productDelete(input: { id: $id }) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `;

    for (const product of products) {
      try {
        const response = await fetch(shopifyEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": marketPlace.accessToken,
          },
          body: JSON.stringify({
            query: mutation,
            variables: { id: product.refId },
          }),
        });

        const data = await response.json();

        if (data.errors) {
          console.error(
            `GraphQL Error: ${data.errors.map((e) => e.message).join(", ")}`
          );
          continue; // Skip to the next product
        }

        const { productDelete } = data.data;

        if (productDelete.userErrors.length > 0) {
          console.error(
            `User Errors for Product ID ${
              product.refId
            }: ${productDelete.userErrors.map((e) => e.message).join(", ")}`
          );
          continue; // Skip to the next product
        }

        if (productDelete.deletedProductId) {
          let logs = await prisma.importedProductLog.update({
            where: {
              ProductId: product.id,
            },
            data: {
              Status: false,
            },
          });
        }

        logger.info(`Product Deleted: ${productDelete.deletedProductId}`);

        let syncStatus = await getRemaining(shop);
        await syncInfoUpdate(
          shop,
          syncStatus.Total,
          syncStatus.Remaining + 1,
          jobStates.Inprogress,
          jobMode.unSync,
          syncStatus.TotalMarketPlaces,
          syncStatus.RemainingMarketPlaces
        );
      } catch (error) {
        console.error(
          `Failed to delete product ${product.refId}: ${error.message}`
        );
      }
    }
  }
}

export default ProductModel;
