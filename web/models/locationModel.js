import axios from "axios";
import { getLocationQuery } from "../graphql/queries.js";
import logger from "../config/logger.js";

class LocationModel {
  static async getStoreLocation(MarketPlaceStoreSession) {
    try {
      // Define the GraphQL query
      const query = getLocationQuery;

      const shopifyEndpoint = `https://${MarketPlaceStoreSession.shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

      // Make the API call using Axios
      const response = await axios.post(
        shopifyEndpoint,
        { query },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": MarketPlaceStoreSession.accessToken,
          },
        }
      );

      // Parse the response data
      const locations = response.data;


      if (locations.errors) {
        logger.error(JSON.stringify(locations.errors));
      }

      // Check if locations data is available
      if (locations && locations.data.locations.edges.length > 0) {
        return locations.data.locations.edges[0].node; // Return the first location's data
      }

      return null; // Return null if no locations exist
    } catch (error) {
      console.error(`Error fetching store locations. Error:`, error.message);
      return null;
    }
  }
}

export default LocationModel;
