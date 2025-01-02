export const FetchProductQuery = `
             query ($first: Int, $after: String) {
  products(first: $first, after: $after) {
    edges {
      node {
        id
        title
        vendor
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

            `;
