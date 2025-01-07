import express from "express";
import productController from "../controllers/productController.js";


const router = express.Router();

router.post("/batch", productController.getProductBatch);
router.get("/vendors", productController.fetchStoreVendors);
router.post("/import", productController.ImportProducts);

export default router;
