import express from "express";
import {
  createConnection,
  connectedDestinationStores,
  connectedSourceStores,
  changeStoreType,
  removeConnection,
  updateSyncModeStatusAll,
  updateSyncModeStatusIndividual,
} from "../controllers/connectionController.js";
const router = express.Router();

router.post("/", createConnection);
router.post("/connectedDestinationStores", connectedDestinationStores); //this is only called by source stores
router.post("/connectedSourceStores", connectedSourceStores); //this is only called by destination stores
router.post("/changeStoreType", changeStoreType);
router.delete("/removeConnection", removeConnection);
router.get("/update/:id/:type/:status",updateSyncModeStatusAll);
router.get("/update/:type/:storeId/:selectStoreId/:status",updateSyncModeStatusIndividual);

export default router;
