import express from 'express';
import {createConnection , connectedDestinationStores , connectedSourceStores ,changeStoreType,removeConnection  } from '../controllers/connectionController.js'; 
const router = express.Router();


router.post('/', createConnection);
router.post('/connectedDestinationStores', connectedDestinationStores)  //this is only called by source stores
router.post('/connectedSourceStores', connectedSourceStores)            //this is only called by destination stores
router.post('/changeStoreType', changeStoreType)
router.delete('/removeConnection', removeConnection)




export default router;
