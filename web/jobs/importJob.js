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

export async function producerQueue(data) {
  logger.info("Import job is added to queue for shop:" + data.shop);

  await StoreInQueueInstance.add(QueueName, data);

  return "Import job is added to queue for Brand " + data.shop;
}

export const worker = new Worker(
  QueueName,
  async (job) => {
    const { products, marketplaces } = job.data; // Access job.data
    logger.info(`Processing job: ${job.id}`);
    logger.info("Data: " + JSON.stringify({ job: job.data }));

    let productToImport = await productImportModel.findProductsFromImportLogs(
      job.data.shop
    );


    let productsToImportFilter = productToImport.data.filter(
      (x) => x.Status == false
    );

    logger.info(
      "Filtered Products to be import count: " + productsToImportFilter.length)
    ;

    // let brandStoreName = job.data.shop;
    // Uncomment and fix the foreach logic
    for (const product of productsToImportFilter) {
      await productImportModel.createProductToMarketPlace(product, job.data);
    }
  },
  { connection: redisConnection } // Fix connection configuration
);
