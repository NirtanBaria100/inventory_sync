import logger from "../config/logger.js";
import {
  checkSourceShop,
  checkDestinationShop,
  checkExistingConnection,
  createNewConnection,
  findConnectedDestinationStores,
  findConnectedSourceStores,
  findStoreByName,
  findConnectionBySourceId,
  findConnectionByDestinationId,
  updateStoreType,
  deleteConnection
} from "../models/connectionModel.js";


// we create a connection between two stores
export const createConnection = async (req, res) => {
  const shop = res.locals.shopify.session.shop;
  const key = req.body.key;

  logger.info(`Received connection request from shop: ${shop}`);

  if (!key) {
    logger.warn("Key is missing in the request body.");
    return res.status(400).send({ error: "key is required." });
  }

  try {
    // Check if the shop making the request is a "source" store
    const sourceShop = await checkSourceShop(shop);
    if (!sourceShop || sourceShop.type !== "source") {
      logger.warn(`Shop ${shop} is not a source store or not found.`);
      return res.status(400).send({ error: "Not a source store." });
    }

    const sourceShopId = sourceShop.id;
    logger.info(`Source shop verified: ${sourceShopId}`);

    // Check if the store with the provided key exists and is a "destination" store
    const destinationShop = await checkDestinationShop(key);
    if (!destinationShop) {
      logger.warn(`Invalid key provided by shop: ${shop}`);
      return res.status(400).send({ error: "Invalid key" });
    } else if (destinationShop.type !== "destination") {
      logger.warn(`Store with key ${key} is not a destination store.`);
      return res.status(400).send({ error: "Store is not a destination store" });
    }

    const destinationShopId = destinationShop.id;
    logger.info(`Destination shop verified: ${destinationShopId}`);

    // Check if a connection between source and destination already exists
    const existingConnection = await checkExistingConnection(sourceShopId);
    if (existingConnection) {
      logger.info(
        `Connection already exists between source: ${sourceShopId} and destination: ${destinationShopId}`
      );
      return res.status(200).json({
        message: "Connection already exists",
        connection: existingConnection,
      });
    }

    // Create a new connection if one does not exist
    const newConnection = await createNewConnection(
      sourceShopId,
      destinationShopId
    );
    logger.info(
      `New connection created between source: ${sourceShopId} and destination: ${destinationShopId}`
    );
    return res.status(201).json({
      message: "New connection created",
      connection: newConnection,
    });
  } catch (error) {
    logger.error(`Error in createConnection: ${error.message}`);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};


// returns the connected destination stores
// this is only called by source stores
export const connectedDestinationStores = async (req, res) => {
  const id = req.body.id;

  logger.info("Received request to fetch connected destination stores.");

  if (!id) {
    logger.warn("ID is missing in the request body.");
    return res.status(400).send({ error: "id is required." });
  }

  try {
    logger.info(`Fetching connected destination stores for id: ${id}`);
    const existingConnection = await findConnectedDestinationStores(id); // checking if any store is connected

    if (!existingConnection) {
      logger.info(`No connected destination stores found for id: ${id}`);
      return res.status(404).json({
        message: "No connected destination stores found for the provided id.",
      });
    }

    logger.info(`Connected destination stores retrieved for id: ${id}`);
    res.status(200).json({ destinationStore: existingConnection.destinationStore });
  } catch (error) {
    logger.error(`Error in connectedDestinationStores: ${error.message}`);
    res.status(500).json({
      message: "An error occurred while retrieving connected destination stores.",
    });
  }
};

// returns the connected source stores
// this is only called by destination stores
export const connectedSourceStores = async (req, res) => {
  const id = req.body.id;

  logger.info("Received request to fetch connected source stores.");

  if (!id) {
    logger.warn("ID is missing in the request body.");
    return res.status(400).send({ error: "id is required." });
  }

  try {
    logger.info(`Fetching connected source stores for id: ${id}`);
    const existingConnection = await findConnectedSourceStores(id); // checking if any store is connected

    if (!existingConnection || existingConnection.length === 0) {
      logger.info(`No connected source stores found for id: ${id}`);
      return res.status(404).json({
        message: "No connected source stores found for the provided id.",
      });
    }

    // Filtering the response for the frontend
    const result = existingConnection.map((item) => ({
      id: item.sourceStore.id,
      storeName: item.sourceStore.storeName,
      status: "Connected",
    }));

    logger.info(`Connected source stores retrieved for id: ${id}`);
    res.status(200).json({ sourceStore: result });
  } catch (error) {
    logger.error(`Error in connectedSourceStores: ${error.message}`);
    res.status(500).json({
      message: "An error occurred while retrieving connected source stores.",
    });
  }
};




// cahnging the type of the store
export const changeStoreType = async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    const type = req.body.type;

    logger.info(`Received request to change store type for shop: ${shop}`);

    if (!type || (type !== "source" && type !== "destination")) {
      logger.warn("Missing or invalid type in request body.");
      return res.status(400).json({ error: "Missing or invalid type" });
    }

    const storeData = await findStoreByName(shop); // confirms shop exists

    if (!storeData) {
      logger.warn(`Store not found for shop: ${shop}`);
      return res.status(404).json({ error: "Store not found" });
    }

    const { id: storeId, type: storeType } = storeData;
    logger.info(`Store found. ID: ${storeId}, Current Type: ${storeType}`);

    if (storeType === "source") {
      const connectionData = await findConnectionBySourceId(storeId); // if connections exist then we can't change type of store until removed

      if (connectionData) {
        logger.warn(`Cannot change store type. Active connections found for store ID: ${storeId}`);
        return res.status(400).json({
          message: "Cannot change store type. Store has active connections. Please remove them from the stores tab first.",
        });
      }
    } else if (storeType === "destination") {
      const connectionData = await findConnectionByDestinationId(storeId); // if connections exist then we can't change type of store until removed

      if (connectionData) {
        logger.warn(`Cannot change store type. Active connections found for store ID: ${storeId}`);
        return res.status(400).json({
          message: "Cannot change store type. Store has active connections. Please remove them from the stores tab first.",
        });
      }
    }

    const updatedStore = await updateStoreType(storeId, type); // if no connection we update the type of the store

    logger.info(`Store type updated successfully for store ID: ${storeId}`);
    res.status(200).json({
      message: "Store type updated successfully",
      updatedStore,
    });
  } catch (error) {
    logger.error(`Error in changeStoreType: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};




// if we want to remove a connection, can be used by destiantin and source store 
export const removeConnection = async (req, res) => {
  const { sourceStoreId, destinationStoreId } = req.body;

  logger.info("Received request to remove connection between stores.");

  if (!sourceStoreId || !destinationStoreId) {
    logger.warn("Missing sourceStoreId or destinationStoreId in request body.");
    return res.status(400).json({ error: "Both sourceStoreId and destinationStoreId are required" });
  }

  try {
    logger.info(`Attempting to remove connection between Source Store ID: ${sourceStoreId} and Destination Store ID: ${destinationStoreId}`);
    const deletedConnection = await deleteConnection(sourceStoreId, destinationStoreId);

    if (deletedConnection.count === 0) {
      logger.warn(`No matching connection found to delete for Source Store ID: ${sourceStoreId} and Destination Store ID: ${destinationStoreId}`);
      return res.status(404).json({ message: "No matching connection found to delete." });
    }

    logger.info(`Connection removed successfully between Source Store ID: ${sourceStoreId} and Destination Store ID: ${destinationStoreId}`);
    res.status(200).json({ message: "Connection removed." });
  } catch (error) {
    logger.error(`Error in removeConnection: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
