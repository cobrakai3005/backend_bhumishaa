import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  toggleCategoryStatus,
} from "../controllers/categories.controller.js";

const categoriesRoutes = express.Router();

categoriesRoutes.post("/create-category", authMiddleware, createCategory);
categoriesRoutes.get("/getAll-category", getAllCategories);
categoriesRoutes.put("/update-category/:id", authMiddleware, updateCategory);
categoriesRoutes.put(
  "/toggle-category-status/:id",
  authMiddleware,
  toggleCategoryStatus,
);

export default categoriesRoutes;
