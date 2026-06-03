import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import {
  createProduct,
  setProductCommission,
  getAllProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
} from "../controllers/product.controller.js";

const productRoutes = express.Router();

productRoutes.post(
  "/create-product",
  authMiddleware,
  upload.array("images", 5),
  createProduct,
);
productRoutes.put(
  "/set-commission/:product_id",
  authMiddleware,
  setProductCommission,
);
productRoutes.get("/getAll-product", getAllProducts);
productRoutes.get("/get-product/:id", getProductById);
productRoutes.put(
  "/update-product/:id",
  authMiddleware,
  upload.array("images", 5),
  updateProduct,
);
productRoutes.put(
  "/toggle-product-status/:id",
  authMiddleware,
  toggleProductStatus,
);

export default productRoutes;
