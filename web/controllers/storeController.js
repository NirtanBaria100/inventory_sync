import { v4 as uuidv4 } from 'uuid';
import {getStoreByName , createStoreInDB} from '../models/storeModel.js'
import logger from '../config/logger.js';


// returns the whole row from the store table 
export const getStoreData = async (req, res) => {
  const shop = res.locals.shopify.session.shop;

  try {
    logger.info("Fetching store data.", { shop });

    // Fetch store details by name
    const storeData = await getStoreByName(shop);

    if (!storeData) {
      logger.warn("Store not found.", { shop });
      return res.status(404).send({ Message: "Store does not exist" });
    }

    logger.info("Store data retrieved successfully.", { shop });
    return res.status(200).send(storeData);
  } catch (error) {
    logger.error("Error fetching store data.", {
      shop,
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).send({ Message: error.message });
  }
};


// inserting a store in the database
export const createStore = async (req, res) => {
  const shop = res.locals.shopify.session.shop;
  const type = req.body.type;

  if (!type) {
    logger.warn("Type is required but not provided.", { shop });
    return res.status(400).send({ error: "Type is required." });
  }

  const uuid = uuidv4(); // Getting a unique key
  const key = uuid.replace(/-/g, ""); // Removing hyphens

  try {
    logger.info("Attempting to create a new store.", { shop, type, key });

    // Creating the store in the database
    const newStore = await createStoreInDB(shop, key, type);

    logger.info("New store created successfully.", { shop, newStore });

    return res.status(201).send({ newStore });
  } catch (error) {
    logger.error("Error creating store.", {
      shop,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).send({ error: "Internal Server Error" });
  }
};

