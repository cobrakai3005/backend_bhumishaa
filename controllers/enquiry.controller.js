import pool from "../confiq/mysqldb.js";
import { sendNotification } from "../utils/notify.js";

export const createEnquiry = async (req, res) => {
  try {
    const { role, id: farmerId } = req?.user;

    if (role !== "Farmer") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { category_id, enquiry_type, title, description } = req?.body;

    if (!category_id || !enquiry_type || !description) {
      return res.status(400).json({
        message: "category_id, enquiry_type and description are required",
        success: false,
      });
    }

    const [insert] = await pool.query(
      `
      INSERT INTO enquiries
      (farmer_id, category_id, enquiry_type, title, description)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        farmerId,
        category_id,
        enquiry_type,
        title || null,
        description,
      ],
    );

    const [enquiry] = await pool.query(`SELECT * FROM enquiries WHERE id=?`, [
      insert.insertId,
    ]);

    res.status(201).json({
      message: `Enquiry Created successfull`,
      success: true,
      data: enquiry[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getRecommendedVendors = async (req, res) => {
  try {
    const { enquiry_id } = req.params;

    const [enquiries] = await pool.query(
      `SELECT * FROM enquiries WHERE id=?`,
      [enquiry_id],
    );

    if (enquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    const enquiry = enquiries[0];

    const [vendors] = await pool.query(
      `
      SELECT DISTINCT vp.*, u.username, u.phone
      FROM vendor_profiles vp
      JOIN users u ON u.id = vp.user_id
      JOIN vendor_categories vc ON vc.vendor_profile_id = vp.id
      WHERE vp.verification_status = 'approved'
      AND vc.category_id = ?
      ORDER BY vp.rating DESC
      `,
      [enquiry.category_id],
    );

    res.status(200).json({
      success: true,
      message: "Recommended vendors fetch successfull",
      data: vendors,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const sendEnquiryToVendor = async (req, res) => {
  try {
    const { role, id: farmerId } = req?.user;

    if (role !== "Farmer") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { enquiry_id, vendor_id } = req?.body;

    if (!enquiry_id || !vendor_id) {
      return res.status(400).json({
        message: "enquiry_id and vendor_id are required",
        success: false,
      });
    }

    const [enquiries] = await pool.query(
      `SELECT * FROM enquiries WHERE id=? AND farmer_id=?`,
      [enquiry_id, farmerId],
    );

    if (enquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    const [insert] = await pool.query(
      `
      INSERT INTO leads (enquiry_id, farmer_id, vendor_id, status)
      VALUES (?, ?, ?, 'sent')
      `,
      [enquiry_id, farmerId, vendor_id],
    );

    await pool.query(`UPDATE enquiries SET status='sent' WHERE id=?`, [
      enquiry_id,
    ]);

    await sendNotification({
      userId: vendor_id,
      title: "New Enquiry Received",
      message: `Farmer sent enquiry #${enquiry_id} to you`,
      referenceType: "lead",
      referenceId: insert.insertId,
    });

    const [admins] = await pool.query(`SELECT id FROM users WHERE role='Admin'`);
    for (const admin of admins) {
      await sendNotification({
        userId: admin.id,
        title: "New Lead Created",
        message: `Lead #${insert.insertId} created for enquiry #${enquiry_id}`,
        referenceType: "lead",
        referenceId: insert.insertId,
      });
    }

    const [lead] = await pool.query(`SELECT * FROM leads WHERE id=?`, [
      insert.insertId,
    ]);

    res.status(201).json({
      message: `Enquiry sent to vendor successfull`,
      success: true,
      data: lead[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getMyEnquiries = async (req, res) => {
  try {
    const { role, id: userId } = req?.user;

    if (role !== "Farmer") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const [rows] = await pool.query(
      `
      SELECT e.*, c.name AS category_name
      FROM enquiries e
      JOIN categories c ON c.id = e.category_id
      WHERE e.farmer_id=?
      ORDER BY e.created_at DESC
      `,
      [userId],
    );

    res.status(200).json({
      success: true,
      message: "Enquiries fetch successfull",
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};
