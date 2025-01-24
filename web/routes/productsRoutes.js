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
router.post("/unsync", productController.unsyn_process_initialize);

export default router;
