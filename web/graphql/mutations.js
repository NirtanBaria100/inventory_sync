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

export const getProductMutation = `
query GetProduct($id: ID!) {
product(id: $id) {
id
title
vendor
descriptionHtml
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
 inventoryQuantity
 
 
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
