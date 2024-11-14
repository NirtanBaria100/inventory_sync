import express from 'express';
import {getStoreData , createStore} from '../controllers/storeController.js'; 
const router = express.Router();


router.get('/',getStoreData);
router.post('/',createStore);



export default router;
