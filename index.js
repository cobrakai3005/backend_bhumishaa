import express from "express";
import cors from "cors";
import cookiesParser from "cookie-parser";
import dotenv from "dotenv";
import authRoute from "./routes/authh.route.js";
// import "./confiq/db.js"
import "./confiq/mysqldb.js";
import cropsRoutes from "./routes/crops.routes.js";
import cropsDetailsRutes from "./routes/crops_details.routes.js";
import cropGuides from "./routes/crop_guides.route.js";
import questionRoutes from "./routes/crop_question.route.js";
import notificationRoutes from "./routes/notifications.route.js";
import categoriesRoutes from "./routes/categories.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import expertSuggestionRoutes from "./routes/expert_suggestion.routes.js";
import "./jobs/unansweredQuestions.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookiesParser());

const corsOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  }),
);

app.use("/api/auth", authRoute);
app.use("/api/crops", cropsRoutes);
app.use("/api/crops_details", cropsDetailsRutes);
app.use("/api/crops_guides", cropGuides);
app.use("/api/crops_questions", questionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/expert-suggestions", expertSuggestionRoutes);

app.use((err, req, res, next) => {
  console.log("GLOBAL ERROR:");
  console.log(err);

  res.status(500).json({
    success: false,
    message: err.message,
    error: err,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server running of PORT ${PORT}`);
});
