import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createEnquiry,
  getRecommendedVendors,
  sendEnquiryToVendor,
  getMyEnquiries,
} from "../controllers/enquiry.controller.js";

const enquiryRoutes = express.Router();

enquiryRoutes.post("/create-enquiry", authMiddleware, createEnquiry);
enquiryRoutes.get("/my-enquiries", authMiddleware, getMyEnquiries);
enquiryRoutes.get(
  "/recommended-vendors/:enquiry_id",
  authMiddleware,
  getRecommendedVendors,
);
enquiryRoutes.post(
  "/send-to-vendor",
  authMiddleware,
  sendEnquiryToVendor,
);

export default enquiryRoutes;
