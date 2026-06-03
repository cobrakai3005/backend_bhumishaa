import pool from "../confiq/mysqldb.js";
import { v2 as cloudinary } from "cloudinary";

const checkApprovedVendor = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM vendor_profiles WHERE user_id=? AND verification_status='approved'`,
    [userId],
  );
  return rows.length > 0;
};

export const createProduct = async (req, res) => {
  try {
    const { role, id: userId } = req?.user;

    if (role !== "Vendor") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const isApproved = await checkApprovedVendor(userId);
    if (!isApproved) {
      return res.status(400).json({
        message: "Vendor must be approved before listing products",
        success: false,
      });
    }

    const { name, description, price, stock, category_id } = req?.body;

    const images = req.files?.length
      ? JSON.stringify(req.files.map((f) => f.path))
      : null;
    const image_ids = req.files?.length
      ? JSON.stringify(req.files.map((f) => f.filename))
      : null;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price are required",
        success: false,
      });
    }

    const [insert] = await pool.query(
      `
      INSERT INTO products
      (vendor_id, category_id, name, description, price, stock, images, image_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        category_id || null,
        name,
        description || null,
        price,
        stock || 0,
        images,
        image_ids,
      ],
    );

    const [product] = await pool.query(`SELECT * FROM products WHERE id=?`, [
      insert.insertId,
    ]);

    res.status(201).json({
      message: `Product Created successfull`,
      success: true,
      data: product[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const setProductCommission = async (req, res) => {
  try {
    const { role, id: adminId } = req?.user;

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { product_id } = req.params;
    const { commission_type, commission_value } = req?.body;

    if (!["fixed", "percentage"].includes(commission_type)) {
      return res.status(400).json({
        message: "commission_type must be fixed or percentage",
        success: false,
      });
    }

    if (!commission_value) {
      return res.status(400).json({
        message: "commission_value is required",
        success: false,
      });
    }

    const [product] = await pool.query(`SELECT * FROM products WHERE id=?`, [
      product_id,
    ]);

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [existing] = await pool.query(
      `SELECT * FROM product_commissions WHERE product_id=?`,
      [product_id],
    );

    if (existing.length > 0) {
      await pool.query(
        `
        UPDATE product_commissions
        SET commission_type=?, commission_value=?, set_by=?
        WHERE product_id=?
        `,
        [commission_type, commission_value, adminId, product_id],
      );
    } else {
      await pool.query(
        `
        INSERT INTO product_commissions
        (product_id, commission_type, commission_value, set_by)
        VALUES (?, ?, ?, ?)
        `,
        [product_id, commission_type, commission_value, adminId],
      );
    }

    const [commission] = await pool.query(
      `SELECT * FROM product_commissions WHERE product_id=?`,
      [product_id],
    );

    res.status(200).json({
      message: "Commission set successfully",
      success: true,
      data: commission[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { limit = 10, page = 1, category_id, vendor_id } = req.query;
    const limitNumber = parseInt(limit);
    const pageNumber = parseInt(page);
    const offset = (pageNumber - 1) * limitNumber;

    let query = `
      SELECT p.*, pc.commission_type, pc.commission_value, u.username AS vendor_name
      FROM products p
      LEFT JOIN product_commissions pc ON pc.product_id = p.id
      JOIN users u ON u.id = p.vendor_id
      WHERE p.is_delete = FALSE AND p.is_active = TRUE
    `;
    const params = [];

    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(category_id);
    }
    if (vendor_id) {
      query += ` AND p.vendor_id = ?`;
      params.push(vendor_id);
    }

    query += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
    params.push(limitNumber, offset);

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      message: "Products fetch successfull",
      page: pageNumber,
      limit: limitNumber,
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT p.*, pc.commission_type, pc.commission_value, u.username AS vendor_name
      FROM products p
      LEFT JOIN product_commissions pc ON pc.product_id = p.id
      JOIN users u ON u.id = p.vendor_id
      WHERE p.id=? AND p.is_delete = FALSE
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetch successfull",
      data: rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { role, id: userId } = req?.user;
    const { id } = req.params;
    const { name, description, price, stock, category_id } = req?.body;

    const [existing] = await pool.query(`SELECT * FROM products WHERE id=?`, [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (role === "Vendor" && existing[0].vendor_id !== userId) {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    if (role !== "Vendor" && role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    let images = existing[0].images;
    let image_ids = existing[0].image_ids;

    if (req.files?.length) {
      const oldIds = existing[0].image_ids
        ? JSON.parse(existing[0].image_ids)
        : [];
      for (const imgId of oldIds) {
        if (imgId) await cloudinary.uploader.destroy(imgId);
      }
      images = JSON.stringify(req.files.map((f) => f.path));
      image_ids = JSON.stringify(req.files.map((f) => f.filename));
    }

    await pool.query(
      `
      UPDATE products
      SET name=?, description=?, price=?, stock=?, category_id=?, images=?, image_ids=?
      WHERE id=?
      `,
      [
        name || existing[0].name,
        description ?? existing[0].description,
        price || existing[0].price,
        stock ?? existing[0].stock,
        category_id ?? existing[0].category_id,
        images,
        image_ids,
        id,
      ],
    );

    const [updated] = await pool.query(`SELECT * FROM products WHERE id=?`, [
      id,
    ]);

    res.status(200).json({
      message: "Product Updated Successfully",
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

export const toggleProductStatus = async (req, res) => {
  try {
    const { role, id: userId } = req?.user;
    const { id } = req.params;

    const [existing] = await pool.query(`SELECT * FROM products WHERE id=?`, [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (role === "Vendor" && existing[0].vendor_id !== userId) {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    if (role !== "Vendor" && role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    await pool.query(`UPDATE products SET is_delete=? WHERE id=?`, [
      !existing[0].is_delete,
      id,
    ]);

    const [updated] = await pool.query(`SELECT * FROM products WHERE id=?`, [
      id,
    ]);

    res.status(200).json({
      message: "Product status updated successfully",
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
