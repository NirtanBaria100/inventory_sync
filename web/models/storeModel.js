import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// get store name using name from session
export const getStoreByName = async (storeName) => {
    const storeData = await prisma.store.findFirst({
      where: {
        storeName: storeName,
      },
    });
  
    return storeData;
  };


// insert a store in the database
  export const createStoreInDB = async (shop, key, type) => {
    return await prisma.store.create({
      data: {
        storeName: shop,
        key: key,
        type: type,
      },
    });
  };