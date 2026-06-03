import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  vendorRespond,
  adminConnectLead,
  adminFollowUp,
  closeLead,
  getLeadById,
  getAllLeads,
} from "../controllers/lead.controller.js";

const leadRoutes = express.Router();

leadRoutes.get("/getAll-lead", authMiddleware, getAllLeads);
leadRoutes.get("/get-lead/:lead_id", authMiddleware, getLeadById);
leadRoutes.post(
  "/vendor-respond/:lead_id",
  authMiddleware,
  vendorRespond,
);
leadRoutes.put(
  "/admin-connect/:lead_id",
  authMiddleware,
  adminConnectLead,
);
leadRoutes.put(
  "/admin-followup/:lead_id",
  authMiddleware,
  adminFollowUp,
);
leadRoutes.put("/close/:lead_id", authMiddleware, closeLead);

export default leadRoutes;
