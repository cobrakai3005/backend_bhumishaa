import pool from "../confiq/mysqldb.js";
import { sendNotification } from "../utils/notify.js";

export const vendorRespond = async (req, res) => {
  try {
    const { role, id: vendorId } = req?.user;
    const { lead_id } = req.params;
    const { message, quotation, attachments } = req?.body;

    if (role !== "Vendor") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const [leads] = await pool.query(
      `SELECT * FROM leads WHERE id=? AND vendor_id=?`,
      [lead_id, vendorId],
    );

    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    await pool.query(
      `
      INSERT INTO vendor_responses (lead_id, vendor_id, message, quotation, attachments)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        lead_id,
        vendorId,
        message || null,
        quotation ? JSON.stringify(quotation) : null,
        attachments ? JSON.stringify(attachments) : null,
      ],
    );

    await pool.query(`UPDATE leads SET status='responded' WHERE id=?`, [
      lead_id,
    ]);

    const lead = leads[0];

    await sendNotification({
      userId: lead.farmer_id,
      title: "Vendor Responded",
      message: `Vendor responded to your enquiry (Lead #${lead_id})`,
      referenceType: "lead",
      referenceId: parseInt(lead_id),
    });

    res.status(200).json({
      message: "Vendor response submitted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const adminConnectLead = async (req, res) => {
  try {
    const { role, id: adminId } = req?.user;
    const { lead_id } = req.params;
    const { notes } = req?.body;

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const [leads] = await pool.query(`SELECT * FROM leads WHERE id=?`, [
      lead_id,
    ]);

    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    await pool.query(
      `
      INSERT INTO lead_admin_logs (lead_id, admin_id, action_type, notes)
      VALUES (?, ?, 'connect', ?)
      `,
      [lead_id, adminId, notes || null],
    );

    await pool.query(`UPDATE leads SET status='admin_connected' WHERE id=?`, [
      lead_id,
    ]);

    const lead = leads[0];

    await sendNotification({
      userId: lead.farmer_id,
      title: "Our Team Connected",
      message: `Admin team is connecting you with the vendor for Lead #${lead_id}`,
      referenceType: "lead",
      referenceId: parseInt(lead_id),
    });

    await sendNotification({
      userId: lead.vendor_id,
      title: "Our Team Connected",
      message: `Admin team is facilitating Lead #${lead_id}`,
      referenceType: "lead",
      referenceId: parseInt(lead_id),
    });

    res.status(200).json({
      message: "Admin connected with parties successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const adminFollowUp = async (req, res) => {
  try {
    const { role, id: adminId } = req?.user;
    const { lead_id } = req.params;
    const { notes } = req?.body;

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const [leads] = await pool.query(`SELECT * FROM leads WHERE id=?`, [
      lead_id,
    ]);

    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    await pool.query(
      `
      INSERT INTO lead_admin_logs (lead_id, admin_id, action_type, notes)
      VALUES (?, ?, 'follow_up', ?)
      `,
      [lead_id, adminId, notes || null],
    );

    await pool.query(`UPDATE leads SET status='nurturing' WHERE id=?`, [
      lead_id,
    ]);

    res.status(200).json({
      message: "Follow up logged successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const closeLead = async (req, res) => {
  try {
    const { role, id: userId } = req?.user;
    const { lead_id } = req.params;
    const { notes } = req?.body;

    const [leads] = await pool.query(`SELECT * FROM leads WHERE id=?`, [
      lead_id,
    ]);

    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const lead = leads[0];

    if (role === "Farmer" && lead.farmer_id !== userId) {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    if (role !== "Farmer" && role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    if (role === "Admin") {
      await pool.query(
        `
        INSERT INTO lead_admin_logs (lead_id, admin_id, action_type, notes)
        VALUES (?, ?, 'close', ?)
        `,
        [lead_id, userId, notes || null],
      );
    }

    await pool.query(
      `UPDATE leads SET status='closed', closed_at=? WHERE id=?`,
      [new Date(), lead_id],
    );

    await pool.query(`UPDATE enquiries SET status='closed' WHERE id=?`, [
      lead.enquiry_id,
    ]);

    res.status(200).json({
      message: "Lead closed successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const { lead_id } = req.params;
    const { role, id: userId } = req?.user;

    const [leads] = await pool.query(
      `
      SELECT l.*, e.title AS enquiry_title, e.description AS enquiry_description
      FROM leads l
      JOIN enquiries e ON e.id = l.enquiry_id
      WHERE l.id=?
      `,
      [lead_id],
    );

    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const lead = leads[0];

    if (
      role !== "Admin" &&
      lead.farmer_id !== userId &&
      lead.vendor_id !== userId
    ) {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const [responses] = await pool.query(
      `SELECT * FROM vendor_responses WHERE lead_id=? ORDER BY created_at DESC`,
      [lead_id],
    );

    const [logs] = await pool.query(
      `SELECT * FROM lead_admin_logs WHERE lead_id=? ORDER BY created_at DESC`,
      [lead_id],
    );

    res.status(200).json({
      success: true,
      message: "Lead fetch successfull",
      data: { ...lead, responses, admin_logs: logs },
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getAllLeads = async (req, res) => {
  try {
    const { role, id: userId } = req?.user;

    let query;
    let params;

    if (role === "Admin") {
      query = `
        SELECT l.*, e.title AS enquiry_title
        FROM leads l
        JOIN enquiries e ON e.id = l.enquiry_id
        ORDER BY l.created_at DESC
      `;
      params = [];
    } else if (role === "Vendor") {
      query = `
        SELECT l.*, e.title AS enquiry_title
        FROM leads l
        JOIN enquiries e ON e.id = l.enquiry_id
        WHERE l.vendor_id=?
        ORDER BY l.created_at DESC
      `;
      params = [userId];
    } else if (role === "Farmer") {
      query = `
        SELECT l.*, e.title AS enquiry_title
        FROM leads l
        JOIN enquiries e ON e.id = l.enquiry_id
        WHERE l.farmer_id=?
        ORDER BY l.created_at DESC
      `;
      params = [userId];
    } else {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      message: "Leads fetch successfull",
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};
