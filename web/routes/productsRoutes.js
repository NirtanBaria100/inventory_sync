import express from "express";
import productController from "../controllers/productController.js";


const router = express.Router();

router.get("/batch/:page", productController.getProductBatch);

export default router;
