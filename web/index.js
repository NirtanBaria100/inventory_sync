// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

import storeRoutes from "./routes/storeRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";

import bodyParser from "body-parser";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use(
  "/api/products",
  shopify.validateAuthenticatedSession(),
  productsRoutes
);
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

const query = `mutation {
  bulkOperationRunQuery(
    query: """
    {
      collections{
        edges {
          node {
            id
            handle
            title
            descriptionHtml
            sortOrder
            templateSuffix
            updatedAt
            publishedOnCurrentPublication
            image {
              width
              height
              url
              altText
            }
            ruleSet {
              appliedDisjunctively
              rules {
                column
                relation
                condition
              }
            }
          }
        }
      }
    }
    """
  ) {
     bulkOperation {
      id
      status
      url
      createdAt
      completedAt
      errorCode
    }
    userErrors {
      field
      message
    }
  }
}`;

// async function runBulkOperation() {
//   try {
//     const SHOPIFY_API_URL = 'https://siar-development.myshopify.com/admin/api/2024-10/graphql.json';
//     const response = await fetch(SHOPIFY_API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Shopify-Access-Token': "shpua_6c43e3033b11ac846b0dc1508e41ae98",
//       },
//       body: JSON.stringify({ query: query }),
//     });

//     const responseBody = await response.json();
//     console.log('Bulk Operation Response:', responseBody.data.bulkOperationRunQuery);
//   } catch (error) {
//     console.error('Error running bulk operation:', error);
//   }
// }
// // runBulkOperation();
// setInterval(async ()=>{
//   const id = "5217808351530";
//           const query = `query {
//             node(id: "gid://shopify/BulkOperation/2988885311574") {
//               ... on BulkOperation {
//                 id
//                 status
//                 errorCode
//                 createdAt
//                 completedAt
//                 objectCount
//                 fileSize
//                 url
//                 partialDataUrl
//               }
//             }
//           }`
//           const URI = `https://siar-development.myshopify.com/admin/api/2024-10/graphql.json`;
//           const response = await fetch(URI, {
//               method: "POST",
//               headers: {
//                   'X-Shopify-Access-Token': "shpua_6c43e3033b11ac846b0dc1508e41ae98",
//                   'Content-Type': 'application/json'
//               },
//               body: JSON.stringify({
//                   query: query
//               })
//           })
//           const  data  = await response.json();
//           console.log("this is data : ", data)
// },5000)

//maadhwan
app.use("/api/shop", storeRoutes);
app.use("/api/connection", connectionRoutes);

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
