import express from "express";
import productController from "../controllers/productController.js";
import { checkConnectionMiddleware } from "../middleware/CheckConnectionMiddleware.js";
import ImportedProductsLogsModel from "../models/importedProductLog.js";

const router = express.Router();

router.post("/batch", productController.getProductBatch);
router.get("/vendors", productController.fetchStoreVendors);
router.post(
  "/sync",
  checkConnectionMiddleware,
  productController.Import_initialize
);
router.get(
  "/sync-info",
  checkConnectionMiddleware,
  productController.CheckSyncInfo
);
router.post("/save-columns", productController.saveColmns);
router.get("/get-columns", productController.getColmns);
router.get("/count/:brand/:marketplace", async (req, res) => {
  try {
    const brand = req.params.brand;
    const marketplace = req.params.marketplace;

    // Fetch products from database by brand name
    const products =
      await ImportedProductsLogsModel.RetrieveProductsByBrandName(brand,marketplace);

    console.log("Brand Products Count:", { products });

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this brand." });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post(
  "/unsync",
  checkConnectionMiddleware,
  productController.unsyn_process_initialize
);

export default router;
