import pool from "../confiq/mysqldb.js";

//  CREATE GUIDE HEADING

export const createGuideHeading = async (req, res) => {
  try {
    const { title, titleHi } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Check duplicate heading
    const [existing] = await pool.query(
      `
      SELECT id
      FROM crop_guide_heading
      WHERE title = ?
      `,
      [title],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Heading already exists",
      });
    }

    // Insert heading
    const [result] = await pool.query(
      `
      INSERT INTO crop_guide_heading (title)
      VALUES (?)
      `,
      [title],
    );

    // Get inserted data
    const [heading] = await pool.query(
      `
      SELECT *
      FROM crop_guide_heading
      WHERE id = ?
      `,
      [result.insertId],
    );

    return res.status(201).json({
      success: true,
      message: "Guide heading created successfully",
      data: heading[0],
    });
  } catch (error) {
    console.error("Create Guide Heading Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* 
   GET ALL GUIDE HEADINGS
 */

export const getAllGuideHeadings = async (req, res) => {
  try {
    console.log("Fetching all guide headings...");
    const [rows] = await pool.query(
      `
      SELECT *
      FROM crop_guide_heading 
      where  is_deleted is  null
      ORDER BY id DESC
      `,
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get Guide Headings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteHeading = async (req, res) => {
  const id = req.params.id;

  try {
    const [existingHeading] = await pool.query(
      `
     select  id from 
      crop_guide_heading
      where id = ? 
      limit 1
      `,
      [id],
    );

    if (existingHeading.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Heading not found",
      });
    }

    //Soft Delete
    await pool.query(
      `
        update  crop_guide_heading
        set is_deleted = true
        where id = ?
      `,
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Heading Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message || "Internal Server  error",
    });
  }
};
