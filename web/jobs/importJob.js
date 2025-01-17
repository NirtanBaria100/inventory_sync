import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/bullMq.js";
import productImportModel from "../models/productImportModel.js";
import logger from "../config/logger.js";

const QueueName = "Stores-Inqueue-products";

const StoreInQueueInstance = new Queue(QueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueueConfig,
});

export async function producerQueueBulk(marketplaces, products) {
  let data = { products, marketplaces };
  await StoreInQueueInstance.addBulk(data);
}

export async function producerQueue(shop) {
  await StoreInQueueInstance.add(QueueName, shop);
}

export const worker = new Worker(
  QueueName,
  async (job) => {
    const { products, marketplaces } = job.data; // Access job.data
    logger.info(`Processing job: ${job.id}`);
    logger.info("Data: " + JSON.stringify({ job: job.data }));

    let productToImport = await productImportModel.findProductsFromImportLogs(
      job.data
    );

    let productsToImportFilter = productToImport.filter(
      (x) => x.status == false
    );
    logger.info(
      "Products to be import: " + JSON.stringify({productsToImportFilter})
    );

    let brandStoreName = job.data;
    // Uncomment and fix the foreach logic
    for (const product of productsToImportFilter) {
        await productImportModel.createProductToMarketPlace(product,brandStoreName);
    }
  },
  { connection: redisConnection } // Fix connection configuration
);
