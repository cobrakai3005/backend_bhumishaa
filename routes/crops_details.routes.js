import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import {
  createCropDetails,
  getAllCropDetails,
  toggleCropsDetailStatus,
  updateCropDetailsImages,
  updateCropsDetails,
} from "../controllers/crops_details.controller.js";

const cropsDetailsRutes = express.Router();

cropsDetailsRutes.post(
  "/create-crop-detail",
  authMiddleware,
  upload.array("crop_details_theme_image", 10),
  createCropDetails,
);
cropsDetailsRutes.get("/getAll-crop-detail", getAllCropDetails);
cropsDetailsRutes.put(
  "/update-crop-details/:id",
  authMiddleware,
  upload.array("crop_details_theme_image", 10),
  updateCropsDetails,
);
cropsDetailsRutes.put(
  "/toggle-crop-detail-status/:id",
  authMiddleware,
  toggleCropsDetailStatus,
);

cropsDetailsRutes.put(
  "/update-crop-detail-images/:id",
  authMiddleware,
  upload.array("crop_details_theme_image", 10),
  updateCropDetailsImages,
);
export default cropsDetailsRutes;
