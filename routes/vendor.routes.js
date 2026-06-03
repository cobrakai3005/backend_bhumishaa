import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import {
  completeVendorProfile,
  verifyVendor,
  getMyVendorProfile,
  getVerifiedVendors,
  getPendingVendors,
} from "../controllers/vendor.controller.js";

const vendorRoutes = express.Router();

vendorRoutes.post(
  "/complete-profile",
  authMiddleware,
  upload.array("documents", 5),
  completeVendorProfile,
);
vendorRoutes.get("/my-profile", authMiddleware, getMyVendorProfile);
vendorRoutes.get("/verified", getVerifiedVendors);
vendorRoutes.get("/pending", authMiddleware, getPendingVendors);
vendorRoutes.put("/verify/:id", authMiddleware, verifyVendor);

export default vendorRoutes;
