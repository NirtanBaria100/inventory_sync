import express from "express";
import productController from "../controllers/productController.js";
import { checkConnectionMiddleware } from "../middleware/CheckConnectionMiddleware.js";

const router = express.Router();

router.post("/batch", productController.getProductBatch);
router.get("/vendors", productController.fetchStoreVendors);
router.post(
  "/sync",
  checkConnectionMiddleware,
  productController.Import_initialize
);
router.get('/sync-info',checkConnectionMiddleware,productController.CheckSyncInfo)
router.post('/save-columns',productController.saveColmns)
router.get('/get-columns',productController.getColmns)
router.post(
  "/unsync",
  checkConnectionMiddleware,
  productController.unsyn_process_initialize
);

export default router;
