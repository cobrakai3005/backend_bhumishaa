import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createSuggestion,
  getRelatedProducts,
  getSuggestionsByQuestion,
} from "../controllers/expert_suggestion.controller.js";

const expertSuggestionRoutes = express.Router();

expertSuggestionRoutes.post(
  "/create-suggestion",
  authMiddleware,
  createSuggestion,
);
expertSuggestionRoutes.get(
  "/by-question/:question_id",
  getSuggestionsByQuestion,
);
expertSuggestionRoutes.get(
  "/related-products/:id",
  getRelatedProducts,
);

export default expertSuggestionRoutes;
