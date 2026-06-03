import express from "express";
const cropsRoutes = express.Router();
import upload from "../middlewares/multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createCrops,
  getAllCrops,
  toggleCropsStatus,
  updateCrops,
} from "../controllers/crops.controller.js";

cropsRoutes.post(
  "/create-crop",
  authMiddleware,
  upload.single("crop_theme_image"),
  createCrops,
);
cropsRoutes.get("/getAll-crop", getAllCrops);
cropsRoutes.put(
  "/update-crop/:id",
  authMiddleware,
  upload.single("crop_theme_image"),
  updateCrops,
);

cropsRoutes.put("/toggle-crop-status/:id", authMiddleware, toggleCropsStatus);

export default cropsRoutes;
