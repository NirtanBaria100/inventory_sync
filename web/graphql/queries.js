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
    category{
      fullName
    }
    status
    tags
    customProductType
    vendor
    descriptionHtml
    media(first:10){
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
    variants(first: 250) {
      nodes {
        id
        title
        price
        sku
        barcode
        compareAtPrice
        inventoryQuantity
        selectedOptions{
          name
          value
        }
        inventoryItem{
          measurement{
            weight{
              unit
              value
            }
          }
          tracked
          countryCodeOfOrigin
          countryHarmonizedSystemCodes(first:10){
            edges{
              node{
                countryCode
                harmonizedSystemCode
              }
            }
          }
            unitCost{
              amount
              currencyCode
            }
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
        inventoryPolicy
        metafields(first:4){
          edges{
            node{
              key
              value
            }
          }
        }
        position
        sku
        taxable
        
      }
    }
    vendor
    collections(first: 20) {
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
