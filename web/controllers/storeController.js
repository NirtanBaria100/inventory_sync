import { v4 as uuidv4 } from 'uuid';
import {getStoreByName , createStoreInDB} from '../models/storeModel.js'


// returns the whole row from the store table 
export const getStoreData = async (req, res) => {
    const shop = res.locals.shopify.session.shop;
  
    try {
      const storeData = await getStoreByName(shop);  // get the store details by name
  
      if (!storeData) {
        return res.status(404).send({ Message: 'Store does not exist' });
      }
  
      return res.status(200).send(storeData);
    } catch (error) {
      console.error(error.message)
      return res.status(500).send({ Message: error.message });
    }
  };


// inserting a store in the database
export const createStore = async (req, res) => {
    const shop = res.locals.shopify.session.shop;
    const type = req.body.type;
  
    if (!type) {
      return res.status(400).send({ error: 'type is required.' });
    }
  
    const uuid = uuidv4();               // getting a unique key 
    const key = uuid.replace(/-/g, ''); // removing hyphens
  
    try {
      const newStore = await createStoreInDB(shop, key, type);  //creating the shop
      return res.status(201).send({ newStore }); 
    } catch (error) {
      console.error('Error creating store:', error);
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  };