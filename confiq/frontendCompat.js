import pool from "./mysqldb.js";

/**
 * Schema tweaks required by the existing frontend (no frontend changes).
 * Safe to run on every startup — ignores duplicate-column errors.
 */
const migrations = [
  `ALTER TABLE crops_question ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE crops_question ADD COLUMN alert_sent BOOLEAN DEFAULT FALSE`,
];

export const applyFrontendCompat = async () => {
  for (const sql of migrations) {
    try {
      await pool.query(sql);
    } catch (err) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        console.warn("frontendCompat:", err.message);
      }
    }
  }
};
