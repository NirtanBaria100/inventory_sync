import prisma from "../config/db.server.js";
import logger from "../config/logger.js";

export async function syncInfoCreate(synDetails, shop, state) {
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
        UpdatedAt: new Date(Date.now()), // Convert timestamp to a Date object
        State: state,
      },
      update: {
        Remaining: 0,
        Total: synDetails.total,
        Shop: shop,
        State: state,
        UpdatedAt: new Date(Date.now()), // Convert timestamp to a Date object
      },
    });
    logger.info("Sync info created successfully.");
  } catch (error) {
    logger.error("Error creating sync info:" + error.message);
    // You can throw the error or handle it depending on your application logic
    throw new Error("Internal server error!");
  }
}

export async function syncInfoUpdate(shop, total, remaining, state, productId) {
  console.log({ shop });
  try {
    let updatedSyncStatus = await prisma.syncStatus.update({
      where: {
        Shop: shop,
      },
      data: {
        Remaining: remaining,
        Total: total,
        State: state,
        ProductImported: productId,
        UpdatedAt: new Date(Date.now()), // Convert timestamp to a Date object
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
    return await prisma.syncStatus.findFirst({
      where: {
        Shop: shop,
      },
    });
  } catch (error) {
    logger.error("error while fetching Sync info for store: " + shop);
    throw new Error("error while fetching Sync info for store: " + shop);
  }
}
