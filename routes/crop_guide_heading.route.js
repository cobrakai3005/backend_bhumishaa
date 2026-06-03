import express from "express";

const router = express.Router();

router.post("/crop_guide_heading", (req, res) => {
  const { title } = req.body;
});
export default router;
