import express from "express";
import pool from "../confiq/mysqldb.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/get_all", authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    const query = user.role === "Admin"
      ? `SELECT * FROM notifications ORDER BY created_at DESC`
      : `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
    const params = user.role === "Admin" ? [] : [user.id];

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

export default router;
