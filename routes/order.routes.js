import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  placeOrder,
  updateOrderStatus,
  getMyOrders,
  getOrderById,
} from "../controllers/order.controller.js";

const orderRoutes = express.Router();

orderRoutes.post("/place-order", authMiddleware, placeOrder);
orderRoutes.put(
  "/update-status/:id",
  authMiddleware,
  updateOrderStatus,
);
orderRoutes.get("/my-orders", authMiddleware, getMyOrders);
orderRoutes.get("/get-order/:id", authMiddleware, getOrderById);

export default orderRoutes;
