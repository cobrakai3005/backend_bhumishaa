import pool from "../confiq/mysqldb.js";

export const createCategory = async (req, res) => {
  try {
    const { role } = req?.user;

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { name, nameHi } = req?.body;

    if (!name || !nameHi) {
      return res.status(400).json({
        message: "Category names are required",
        success: false,
      });
    }

    const [result] = await pool.query(
      `INSERT INTO categories (name, nameHi, is_active) VALUES (?, ?, TRUE)`,
      [name, nameHi],
    );

    const [row] = await pool.query(`SELECT * FROM categories WHERE id=?`, [
      result.insertId,
    ]);

    res.status(201).json({
      message: `Category Created successfull`,
      success: true,
      data: row[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM categories WHERE is_active = TRUE ORDER BY id`,
    );

    res.status(200).json({
      success: true,
      message: "Categories fetch successfull",
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { role } = req?.user;

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { id } = req.params;
    const { name, nameHi, is_active } = req?.body;

    const [existing] = await pool.query(`SELECT * FROM categories WHERE id=?`, [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await pool.query(
      `UPDATE categories SET name=?, nameHi=?, is_active=? WHERE id=?`,
      [
        name || existing[0].name,
        nameHi || existing[0].nameHi,
        is_active ?? existing[0].is_active,
        id,
      ],
    );

    const [updated] = await pool.query(`SELECT * FROM categories WHERE id=?`, [
      id,
    ]);

    res.status(200).json({
      message: "Category Updated Successfully",
      success: true,
      data: updated[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { role } = req?.user;

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { id } = req.params;

    const [existing] = await pool.query(`SELECT * FROM categories WHERE id=?`, [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await pool.query(`UPDATE categories SET is_active=? WHERE id=?`, [
      !existing[0].is_active,
      id,
    ]);

    res.status(200).json({
      message: `Category ${existing[0].is_active ? "Deactivated" : "Activated"} Successfully`,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};
