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

export const fetchProductByIdQuery = `
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

export const fetchCollectionByNameQuery = `
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

export const getProductQuery = `
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    title
    vendor
    descriptionHtml
    media(first:250){
      edges{
        node{
          mediaContentType
          preview{
            image{
              url
              altText
            }
          }
        }
      }
    }
  	options{
      name
      values
      position
      optionValues{
        name
        swatch
        {
          color
          image{
            alt
            image{
              altText
              url
            }
          }
        }
      }
      
      
    }
    variants(first: 10) {
      nodes {
        id
        title
        price
        sku
        compareAtPrice
        inventoryQuantity
        selectedOptions{
          name
          value
        }
        	inventoryItem{
            tracked
            inventoryLevels(first: 4) {
                     edges {
                       node {
                         id
                         location{
                          address{address2}
                         }
                         quantities(names: ["committed", "on_hand", "incoming", "available"]) {
                           name
                           quantity
                         }
                       }
                     }
                   }
        }
        
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

export const getLocationQuery = `
            query {
              locations(first: 5) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          `;
