import pool from "../confiq/mysqldb.js";
import { sendNotification } from "../utils/notify.js";

export const completeVendorProfile = async (req, res) => {
  try {
    const { role, id: userId } = req?.user;

    if (role !== "Vendor") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { business_name, business_description, location, category_ids } =
      req?.body;

    const documents = req.files?.length
      ? JSON.stringify(req.files.map((f) => f.path))
      : req.body.documents
        ? JSON.stringify(req.body.documents)
        : null;

    if (!business_name) {
      return res.status(400).json({
        message: "Business name is required",
        success: false,
      });
    }

    const [existing] = await pool.query(
      `SELECT * FROM vendor_profiles WHERE user_id=?`,
      [userId],
    );

    let profileId;

    if (existing.length > 0) {
      await pool.query(
        `
        UPDATE vendor_profiles
        SET business_name=?, business_description=?, location=?, documents=?
        WHERE user_id=?
        `,
        [
          business_name,
          business_description || null,
          location || null,
          documents,
          userId,
        ],
      );
      profileId = existing[0].id;
    } else {
      const [insert] = await pool.query(
        `
        INSERT INTO vendor_profiles
        (user_id, business_name, business_description, location, documents)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          userId,
          business_name,
          business_description || null,
          location || null,
          documents,
        ],
      );
      profileId = insert.insertId;
    }

    if (category_ids) {
      const ids = Array.isArray(category_ids)
        ? category_ids
        : JSON.parse(category_ids);

      await pool.query(
        `DELETE FROM vendor_categories WHERE vendor_profile_id=?`,
        [profileId],
      );

      for (const categoryId of ids) {
        await pool.query(
          `INSERT INTO vendor_categories (vendor_profile_id, category_id) VALUES (?, ?)`,
          [profileId, categoryId],
        );
      }
    }

    const [profile] = await pool.query(
      `SELECT * FROM vendor_profiles WHERE id=?`,
      [profileId],
    );

    res.status(201).json({
      message: `Vendor profile submitted for verification`,
      success: true,
      data: profile[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const verifyVendor = async (req, res) => {
  try {
    const { role, id: adminId } = req?.user;

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { id } = req.params;
    const { status, rejection_reason } = req?.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected",
        success: false,
      });
    }

    const [vendor] = await pool.query(
      `SELECT * FROM vendor_profiles WHERE id=?`,
      [id],
    );

    if (vendor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    await pool.query(
      `
      UPDATE vendor_profiles
      SET verification_status=?, rejection_reason=?, verified_by=?, verified_at=?
      WHERE id=?
      `,
      [status, rejection_reason || null, adminId, new Date(), id],
    );

    await sendNotification({
      userId: vendor[0].user_id,
      title: "Vendor Verification Update",
      message: `Your vendor account has been ${status}`,
      referenceType: "vendor_profile",
      referenceId: parseInt(id),
    });

    const [updated] = await pool.query(
      `SELECT * FROM vendor_profiles WHERE id=?`,
      [id],
    );

    res.status(200).json({
      message: `Vendor ${status} successfully`,
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

export const getMyVendorProfile = async (req, res) => {
  try {
    const { id: userId } = req?.user;

    const [profile] = await pool.query(
      `SELECT vp.*, u.username, u.phone
       FROM vendor_profiles vp
       JOIN users u ON u.id = vp.user_id
       WHERE vp.user_id=?`,
      [userId],
    );

    if (profile.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    const [categories] = await pool.query(
      `
      SELECT c.*
      FROM vendor_categories vc
      JOIN categories c ON c.id = vc.category_id
      WHERE vc.vendor_profile_id=?
      `,
      [profile[0].id],
    );

    res.status(200).json({
      success: true,
      message: "Vendor profile fetch successfull",
      data: { ...profile[0], categories },
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getVerifiedVendors = async (req, res) => {
  try {
    const { category_id, limit = 10, page = 1 } = req.query;
    const limitNumber = parseInt(limit);
    const pageNumber = parseInt(page);
    const offset = (pageNumber - 1) * limitNumber;

    let query = `
      SELECT DISTINCT vp.*, u.username, u.phone
      FROM vendor_profiles vp
      JOIN users u ON u.id = vp.user_id
      WHERE vp.verification_status = 'approved'
    `;
    const params = [];

    if (category_id) {
      query += `
        AND vp.id IN (
          SELECT vendor_profile_id FROM vendor_categories WHERE category_id = ?
        )
      `;
      params.push(category_id);
    }

    query += ` ORDER BY vp.rating DESC LIMIT ? OFFSET ?`;
    params.push(limitNumber, offset);

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      message: "Verified vendors fetch successfull",
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

export const getPendingVendors = async (req, res) => {
  try {
    const { role } = req?.user;

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const [rows] = await pool.query(
      `
      SELECT vp.*, u.username, u.phone
      FROM vendor_profiles vp
      JOIN users u ON u.id = vp.user_id
      WHERE vp.verification_status = 'pending'
      ORDER BY vp.created_at DESC
      `,
    );

    res.status(200).json({
      success: true,
      message: "Pending vendors fetch successfull",
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};
