import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// we check if it is a source shop
export const checkSourceShop = async (shop) => {
  //this is checked using the shop name
  return await prisma.store.findFirst({
    where: { storeName: shop },
    select: { id: true, type: true },
  });
};

//  we check if it is a destinationn shop
export const checkDestinationShop = async (key) => {
  // this is checked using the unique key
  return await prisma.store.findFirst({
    where: { key: key },
    select: { id: true, type: true },
  });
};

// checks a existing a connection
export const checkExistingConnection = async (sourceShopId) => {
  // using find first , cause a brand can only be connected to one store and wont allow other connections till connection removed
  return await prisma.connection.findFirst({
    where: { sourceStoreId: sourceShopId },
  });
};

// creates a new connection
export const createNewConnection = async (sourceShopId, destinationShopId) => {
  return await prisma.connection.create({
    data: {
      sourceStore: { connect: { id: sourceShopId } },
      destinationStore: { connect: { id: destinationShopId } },
    },
  });
};

// cehcking if any destination store is connected
export const findConnectedDestinationStores = async (sourceStoreId) => {
  return await prisma.connection.findMany({
    // using find as a source store can have only one destination stores connected
    where: {
      sourceStoreId,
    },
    include: {
      destinationStore: true,
    },
  });
};

// chcking if any source store is connected
export const findConnectedSourceStores = async (destinationStoreId) => {
  return await prisma.connection.findMany({
    // using findmany as a destination store can have many source stores connected
    where: {
      destinationStoreId,
    },
    include: {
      sourceStore: true,
    },
  });
};

// finding a store by name
// new function since it can be destiantion or source shop
export const findStoreByName = (storeName) => {
  return prisma.store.findFirst({
    where: { storeName },
    select: { id: true, type: true,storeName:true },
  });
};

// finds connections using source store id
export const findConnectionBySourceId = (storeId) => {
  return prisma.connection.findFirst({
    where: { sourceStoreId: storeId },
  });
};

// finds connections using destination store id
export const findConnectionByDestinationId = (storeId) => {
  return prisma.connection.findFirst({
    where: { destinationStoreId: storeId },
  });
};

export const updateStoreType = (storeId, type) => {
  return prisma.store.update({
    where: { id: storeId },
    data: { type },
  });
};



// deletes the conenction using both the source store id and the destination store id
export const deleteConnection = async (sourceStoreId, destinationStoreId) => {
  return await prisma.connection.deleteMany({
    where: {
      sourceStoreId,
      destinationStoreId,
    },
  });
};
