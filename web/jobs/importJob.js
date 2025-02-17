import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/bullMq.js";
import productImportModel from "../models/productImportModel.js";
import logger from "../config/logger.js";
import { jobStates } from "../utils/jobStates.js";
import { getRemaining, syncInfoUpdate } from "../models/syncInfoModel.js";
import { jobMode } from "../frontend/utils/jobMode.js";
import { getColumns } from "../models/ColumnSelection.js";
import { findConnectedDestinationStores } from "../models/connectionModel.js";

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

    //find connected marketplace with the brand store
    let connectedStores = await findConnectedDestinationStores(
      job.data.brandStoreId
    );

    let connectedStoresNames = connectedStores.map(
      (item) => item.destinationStore.storeName
    );

    logger.info(
      "Products will be sync to following marketplaces: " +
        JSON.stringify({
          connectedStores: connectedStoresNames,
        })
    );

    let syncStatus = await getRemaining(job.data.shop);

    //updates the status of job in the database to in-progress
    // logger.info("Saving sync info to database!🤔: " + shop);
    await syncInfoUpdate(
      shop,
      syncStatus.Total,
      0,
      jobStates.Inprogress,
      jobMode.sync,
      connectedStoresNames.length,
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
    for (const destinationStoreName of connectedStoresNames) {
      logger.info(
        `============================= Importing Products to : ${destinationStoreName} ==================================`
      );
      for (const product of productsToImportFilter) {
        try {
          await productImportModel.createProductToMarketPlace(
            product,
            job.data,
            getColumnsToBeSync,
            session,
            destinationStoreName
          );
        } catch (error) {
          logger.error(error.message);
          continue;
        }
      }

      let syncStatus = await getRemaining(shop);

      let afterUpdate = await syncInfoUpdate(
        shop,
        productsToImportFilter.length,
        syncStatus.Remaining,
        jobStates.Inprogress,
        jobMode.sync,
        syncStatus.TotalMarketPlaces,
        syncStatus.RemainingMarketPlaces + 1
      );

      if (
        afterUpdate.Remaining == syncStatus.Total &&
        afterUpdate.RemainingMarketPlaces == afterUpdate.TotalMarketPlaces
      ) {
        await syncInfoUpdate(
          shop,
          syncStatus.Total,
          syncStatus.Remaining,
          jobStates.Finish,
          jobMode.sync,
          afterUpdate.TotalMarketPlaces,
          afterUpdate.RemainingMarketPlaces
        );
      } else {
        await syncInfoUpdate(
          shop,
          syncStatus.Total,
          0,
          jobStates.Finish,
          jobMode.sync,
          afterUpdate.TotalMarketPlaces,
          afterUpdate.RemainingMarketPlaces
        );
      }
    }
  },
  { connection: redisConnection } // Fix connection configuration
);
