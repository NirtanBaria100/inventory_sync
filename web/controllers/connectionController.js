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

  if (!key) {
    return res.status(400).send({ error: "key is required." });
  }

  // Check if the shop making the request is a "source" store
  const sourceShop = await checkSourceShop(shop);
  if (!sourceShop || sourceShop.type !== "source") {
    return res.status(400).send({ error: "Not a source store." });
  }

  const sourceShopId = sourceShop.id;

  // Check if the store with the provided key exists and is a "destination" store
  const destinationShop = await checkDestinationShop(key);
  if (!destinationShop) {
    return res.status(400).send({ error: "Invalid key" });
  } else if (destinationShop.type !== "destination") {
    return res.status(400).send({ error: "Store is not a destination store" });
  }

  const destinationShopId = destinationShop.id;

  // Check if a connection between source and destination already exists
  const existingConnection = await checkExistingConnection(sourceShopId);
  if (existingConnection) {
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
  return res.status(201).json({
    message: "New connection created",
    connection: newConnection,
  });
};



// returns the connected destination stores
// this is only called by source stores
export const connectedDestinationStores = async (req, res) => {
  const id = req.body.id;

  if (!id) {
    return res.status(400).send({ error: "id is required." });
  }

  try {
    const existingConnection = await findConnectedDestinationStores(id);  // checking if any store is conencted

    if (!existingConnection) {
      return res.status(404).json({
        message: "No connected destination stores found for the provided id.",
      });
    }

    res
      .status(200)
      .json({ destinationStore: existingConnection.destinationStore });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "An error occurred while retrieving connected destination stores.",
    });
  }
};

// returns the connected source stores
// this is only called by destination stores
export const connectedSourceStores = async (req, res) => {
    const id = req.body.id;
  
    if (!id) {
      return res.status(400).send({ error: "id is required." });
    }
  
    try {
      const existingConnection = await findConnectedSourceStores(id);   // checking if any store is conencted
  
      if (!existingConnection || existingConnection.length === 0) {
        return res.status(404).json({
          message: "No connected source stores found for the provided id.",
        });
      }

      // filtering this response here for frontend
      //filtered hre since i used findMany
      const result = existingConnection.map(item => ({
        id: item.sourceStore.id,
        storeName: item.sourceStore.storeName,
        status: 'Connected'
      }));
  
      res.status(200).json({ sourceStore: result });
    } catch (error) {
      console.error(error);
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
    
    if (!type || (type !== 'source' && type !== 'destination')) {
      return res.status(400).json({ error: "Missing or invalid type" });
    }

    const storeData = await findStoreByName(shop);   // confirms shop exists

    if (!storeData) {
      return res.status(404).json({ error: "Store not found" });
    }

    const { id: storeId, type: storeType } = storeData;

    if (storeType === 'source') {  // different functon called for source and destination
      const connectionData = await findConnectionBySourceId(storeId);  //if connections exist then we cant change type of store until removed

      if (connectionData) {
        return res.status(400).json({
          message: "Cannot change store type. Store has active connections. Please remove them from the stores tab first."
        });
      }

    } else if (storeType === 'destination') {        // different functon called for source and destination
      const connectionData = await findConnectionByDestinationId(storeId);  //if connections exist then we cant change type of store until removed

      if (connectionData) {               // if store connections then we cant change type
        return res.status(400).json({
          message: "Cannot change store type. Store has active connections. Please remove them from the stores tab first."
        });
      }

    }

    const updatedStore = await updateStoreType(storeId, type);   // if no connection we update the type of the store 

    res.status(200).json({ message: "Store type updated successfully", updatedStore });
  } catch (error) {
    console.error("Error updating store type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



// if we want to remove a connection, can be used by destiantin and source store 
export const removeConnection = async (req, res) => {
  const { sourceStoreId, destinationStoreId } = req.body;

  if (!sourceStoreId || !destinationStoreId) {
    return res.status(400).json({ error: 'Both sourceStoreId and destinationStoreId are required' });
  }

  try {
    const deletedConnection = await deleteConnection(sourceStoreId, destinationStoreId);
    
    if (deletedConnection.count === 0) {
      return res.status(404).json({ message: 'No matching connection found to delete.' });  
    }

    res.status(200).json({ message: 'Connection removed.' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};