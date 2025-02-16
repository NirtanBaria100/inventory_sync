import prisma from "../config/db.server.js";
import logger from "../config/logger.js";

export async function saveColmns(shop, data) {
  try {
    let columns = data.columns;
    await prisma.columnSelection.upsert({
      where: { shop },
      create: { shop, ...columns },
      update: { ...columns },
    });

    logger.info(`Columns successfully saved for shop: ${shop}`);
  } catch (error) {
    logger.error(`Database error while saving columns for ${shop}:`, error);
    throw error;
  }
}

export async function getColumns(shop) {
  return await prisma.columnSelection.findFirst({
    where: {
      shop: shop,
    },
  });
}
