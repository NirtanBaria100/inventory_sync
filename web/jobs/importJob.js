import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/bullMq.js";
import productImportModel from "../models/productImportModel.js";
import logger from "../config/logger.js";
import { jobStates } from "../utils/jobStates.js";
import { getRemaining, syncInfoUpdate } from "../models/syncInfoModel.js";
import { jobMode } from "../frontend/utils/jobMode.js";
import { getColumns } from "../models/ColumnSelection.js";

const QueueName = "Stores-Inqueue-products";

const StoreInQueueInstance = new Queue(QueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueueConfig,
});

export async function producerQueueBulk(marketplaces, products) {
  let data = { products, marketplaces };
  await StoreInQueueInstance.addBulk(data);
}

export async function SyncProducerQueue(data) {
  // logger.info("Import job is added to queue for shop:" + data.shop);

  await StoreInQueueInstance.add(QueueName, data);

  return "Syncing in progress!";
}

export const worker = new Worker(
  QueueName,
  async (job) => {
    const { products, marketplaces, shop, session } = job.data; // Access job.data
    logger.info(`Processing Import job: ${job.id}`);

    let syncStatus = await getRemaining(job.data.shop);

    //updates the status of job in the database to in-progress
    // logger.info("Saving sync info to database!🤔: " + shop);
    await syncInfoUpdate(
      shop,
      syncStatus.Total,
      0,
      jobStates.Inprogress,
      jobMode.sync,
      0,
      0
    );

    let productToImport = await productImportModel.findProductsFromImportLogs(
      shop
    );

    let productsToImportFilter = productToImport.data.filter(
      (x) => x.Status == false
    );

    logger.info(
      "Products about to import Count: " + productsToImportFilter.length
    );

    let getColumnsToBeSync = await getColumns(shop);

    // let brandStoreName = shop;
    // Uncomment and fix the foreach logic
    for (const product of productsToImportFilter) {
      try {
        await productImportModel.createProductToMarketPlace(
          product,
          job.data,
          getColumnsToBeSync,
          session
        );
      } catch (error) {
        logger.error(error.message);
        continue;
      }
    }
  },
  { connection: redisConnection } // Fix connection configuration
);
