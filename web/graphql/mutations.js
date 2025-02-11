export const collectionCreateMutation = `
        mutation CollectionCreate($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

export const addTagsMutation = `mutation addTags($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) {
    node {
      id
    }
    userErrors {
      message
    }
  }
}`;

export const productCreateMutation = `
            mutation createProduct($input: ProductInput!,$media:[CreateMediaInput!]) {
              productCreate(input: $input, media: $media) {
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
                        barcode
                        
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
export const productsetMutation = `mutation createProduct($productSet: ProductSetInput!) {
  productSet( input: $productSet) {
    product {
      id
    }
    userErrors {
      field
      message
    }
  }
}`;
