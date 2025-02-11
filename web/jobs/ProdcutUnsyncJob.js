import logger from "../config/logger.js";
import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/bullMq.js";
import productImportModel from "../models/productImportModel.js";
import { getRemaining, syncInfoUpdate } from "../models/syncInfoModel.js";
import { jobStates } from "../utils/jobStates.js";
import { jobMode } from "../frontend/utils/jobMode.js";

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

  

    //updates the status of job in the database to in-progress
    logger.info("Saving un-sync info to database!🤔: "+job.data.shop);
 
    
    await productImportModel.deleteProductToMarketPlace(
      job.data.productsIds,
      job.data.shop,
      marketplaces
    );

  },
  { connection: redisConnection } // Fix connection configuration
);
