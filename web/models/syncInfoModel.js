import prisma from "../config/db.server.js";
import logger from "../config/logger.js";
import ImportedProductsLogsModel from "./importedProductLog.js";

export async function syncInfoCreate(
  synDetails,
  shop,
  state,
  mode,
  TotalMarketPlaces,
  RemainingMarketPlaces
) {
  console.log({ shop });
  try {
    await prisma.syncStatus.upsert({
      where: {
        Shop: shop,
      },
      create: {
        Remaining: 0,
        Total: synDetails.total,
        Shop: shop,
        UpdatedAt: new Date(Date.now()).toISOString(), // Convert timestamp to a Date object
        CreateAt: new Date(Date.now()).toISOString(),
        State: state,
        mode,
        TotalMarketPlaces,
        RemainingMarketPlaces,
      },
      update: {
        Remaining: 0,
        Total: synDetails.total,
        Shop: shop,
        State: state,
        UpdatedAt: new Date(Date.now()).toISOString(), // Convert timestamp to a Date object
        CreateAt: new Date(Date.now()).toISOString(),
        mode,
        TotalMarketPlaces,
        RemainingMarketPlaces,
      },
    });
    logger.info("Sync info created successfully.");
  } catch (error) {
    logger.error("Error creating sync info:" + error.message);
    // You can throw the error or handle it depending on your application logic
    throw new Error("Internal server error!");
  }
}

export async function syncInfoUpdate(
  shop,
  total,
  remaining,
  state,
  mode,
  TotalMarketPlaces,
  RemainingMarketPlaces
) {
  try {
    let updatedSyncStatus = await prisma.syncStatus.update({
      where: {
        Shop: shop,
      },
      data: {
        Remaining: remaining,
        Total: total,
        State: state,
        UpdatedAt: new Date(Date.now()).toISOString(), // Convert timestamp to a Date object
        mode,
        TotalMarketPlaces,
        RemainingMarketPlaces,
      },
    });
    logger.info("Sync info Updated successfully.");
    return updatedSyncStatus;
  } catch (error) {
    logger.error("Error updating sync info:" + error.message);
    // You can throw the error or handle it depending on your application logic
    throw new Error("Internal server error!");
  }
}

export async function getRemaining(shop) {
  try {
    let syncStatus = await prisma.syncStatus.findFirst({
      where: { Shop: shop.shop },
      select: {
        Remaining: true,
        Total: true,
        mode: true,
        TotalMarketPlaces:true,
        RemainingMarketPlaces:true
      },
    });
    return syncStatus;
  } catch (error) {
    logger.error("Error getting remaining products for sync:" + error.message);
    // You can throw the error or handle it depending on your application logic
    throw new Error("Internal server error!");
  }
}

export async function getSyncInfo(shop) {
  try {
    let synInfo = await prisma.syncStatus.findFirst({
      where: {
        Shop: shop,
      },
    });

    let importedProducts =
      await ImportedProductsLogsModel.getImportedProductLogsDateWise(
        //Mysql doest not support camparision of date with millisecond
        synInfo.CreateAt.toISOString(),
        synInfo.UpdatedAt.toISOString()
      );

    console.log({ importedProducts });

    return synInfo;
  } catch (error) {
    logger.error(
      "error while fetching Sync info for store: " + shop + "Error:" + error
    );
    throw new Error("error while fetching Sync info for store: " + shop);
  }
}
