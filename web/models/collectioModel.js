import axios from "axios";
import { collectionCreateMutation } from "../graphql/mutations.js";
import { fetchCollectionByNameQuery } from "../graphql/queries.js";

class ProductCollectionModel {
  static async CreateCollectionShopify(title, session) {
    try {
      // GraphQL mutation
      const query = collectionCreateMutation;

      // Shopify GraphQL Admin API endpoint
      const graphqlEndpoint = `https://${session.shop}/admin/api/2025-01/graphql.json`;

      // Set headers
      const headers = {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      };

      // Make API request
      const response = await axios.post(
        graphqlEndpoint,
        {
          query,
          variables: {
            input: {
              title,
            },
          },
        },
        { headers }
      );

      // Extract data and handle errors
      const { data, errors } = response.data;

      if (errors || data.userErrors) {
        console.error("User Errors:", errors || data.userErrors);
        throw new Error("Failed to create collection.");
      }

      console.log("Collection Created:", data.collectionCreate.collection);
      return data.collectionCreate.collection.id;
    } catch (error) {
      console.error("Error creating collection:", error.message);
      throw new Error("Collection creation failed. Check logs for details.");
    }
  }

  static async checkExistingShopifyCollection(name,session) {
    try {
      // Define the GraphQL query
      const query = `
        query ($title: String!) {
          collections(first: 1, query: $title) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `;

      // GraphQL endpoint
      const graphqlEndpoint = `https://${session.shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

      // Set the headers
      const headers = {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      };

      // Make the API call
      const response = await fetch(graphqlEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          variables: {
            title: `title:${name}`, // Shopify's GraphQL query syntax for filtering collections
          },
        }),
      });

      // Parse the response
      const result = await response.json();

      // Check for errors in the GraphQL response
      if (result.errors) {
        console.error(
          `GraphQL errors occurred while checking for collection:`,
          result.errors
        );
        throw new Error("Failed to query collections due to GraphQL errors.");
      }

      // Extract the collections data
      const edges = result.data?.collections?.edges || [];

      // Check if any collection exists with the given title
      if (edges.length > 0) {
        return edges[0].node; // Return the existing collection data
      }

      // If no collection found, return null
      return null;
    } catch (error) {
      console.error(
        `Error checking existing Shopify collection for name: ${name}.`,
        error.message
      );
      return null;
    }
  }
}

export default ProductCollectionModel;
