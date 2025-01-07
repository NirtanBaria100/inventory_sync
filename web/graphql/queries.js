export const FetchProductQuery = `
             query ($first: Int, $after: String = null ,$query:String = null, $before:String, $last:Int) {
  products(first: $first, after: $after,query:$query, before:$before, last:$last) {
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
      hasPreviousPage
      startCursor
    } 
  }
}

            `;

export const fetchVendorsQuery = `
          query productVendors($first: Int!, $after: String) {
            productVendors(first: $first, after: $after) {
              edges {
                node
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;
