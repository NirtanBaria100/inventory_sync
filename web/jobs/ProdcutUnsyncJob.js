import logger from "../config/logger.js";
import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/bullMq.js";
import productImportModel from "../models/productImportModel.js";

const QueueName = "Stores-Inqueue-products-unsync";

const StoreInQueueInstance = new Queue(QueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueueConfig,
});

export async function UnSyncProducerQueue(data) {
  logger.info("product Un-sync job is added to queue for shop:" + data.shop);

  await StoreInQueueInstance.add(QueueName, data);
}

export const worker = new Worker(
  QueueName,
  async (job) => {
    try {
    } catch (error) {
      logger.error(
        "Error while delete products from marketplace " +
          data.shop +
          ":" +
          error
      );
    }
    const { products, marketplaces } = job.data; // Access job.data
    logger.info(`Processing job: ${job.id}`);
    logger.info("Data: " + JSON.stringify({ job: job.data }));

    await productImportModel.deleteProductToMarketPlace(
      job.data.productsIds,
      job.data.shop,
      marketplaces
    );

    // let productToImport = await productImportModel.findProductsFromImportLogs(
    //   job.data.shop
    // );

    // let productsToImportFilter = productToImport.data.filter(
    //   (x) => x.Status == false
    // );

    // logger.info(
    //   "Filtered Products to be import count: " + productsToImportFilter.length)
    // ;

    // // let brandStoreName = job.data.shop;
    // // Uncomment and fix the foreach logic
    // for (const product of productsToImportFilter) {
    //   await productImportModel.createProductToMarketPlace(product, job.data);
    // }
  },
  { connection: redisConnection } // Fix connection configuration
);
