import axios from "axios";
import { FetchProductQuery } from "../graphql/queries.js";

class productController {
  static async getProductBatch(req, res) {
    try {
      const { accessToken, shop } = res.locals.shopify.session;

      const allProducts = [];
      let hasNextPage = true;
      let endCursor = null;
      let limit = 240;

      const graphqlEndpoint = `https://${shop}/admin/api/2024-01/graphql.json`;

      //   while (hasNextPage) {
      const query = FetchProductQuery;

      const variables = { first: limit, after: endCursor };
      const headers = {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken, // Ensure Admin API Token
      };

      const response = await axios.post(
        graphqlEndpoint,
        { query, variables },
        { headers }
      );
      const data = response.data.data.products;

      // Append fetched products to `allProducts`
      data.edges.forEach(({ node }) => {
        allProducts.push({
          id: node.id,
          title: node.title,
          vendor: node.vendor,
        });
      });

      // Update pagination variables
      hasNextPage = data.pageInfo.hasNextPage;
      endCursor = data.pageInfo.endCursor;

      return res
        .status(200)
        .json({ data: allProducts, hasNextPage, endCursor });
    } catch (error) {
      if (error.response)
        console.error("Error response data:", error.response.data);
      return res.status(500).json({ data: [], error: error.message });
    }
  }
}

export default productController;
