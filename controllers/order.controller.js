import pool from "../confiq/mysqldb.js";
import { sendNotification } from "../utils/notify.js";

const generateOrderNumber = () =>
  `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const calcCommission = (price, quantity, commission) => {
  if (!commission) return 0;
  const subtotal = price * quantity;
  if (commission.commission_type === "fixed") {
    return commission.commission_value * quantity;
  }
  return (subtotal * commission.commission_value) / 100;
};

export const placeOrder = async (req, res) => {
  try {
    const { role, id: customerId } = req?.user;

    if (!["Farmer", "Customer"].includes(role)) {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const {
      product_id,
      quantity = 1,
      shipping_address,
      question_id,
      suggestion_id,
    } = req?.body;

    if (!product_id) {
      return res.status(400).json({
        message: "product_id is required",
        success: false,
      });
    }

    const [products] = await pool.query(
      `SELECT * FROM products WHERE id=? AND is_delete=FALSE AND is_active=TRUE`,
      [product_id],
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = products[0];

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        success: false,
      });
    }

    const [commissions] = await pool.query(
      `SELECT * FROM product_commissions WHERE product_id=?`,
      [product_id],
    );

    const commissionAmount = calcCommission(
      product.price,
      quantity,
      commissions[0],
    );
    const totalAmount = product.price * quantity;
    const orderNumber = generateOrderNumber();

    const [insert] = await pool.query(
      `
      INSERT INTO orders
      (order_number, customer_id, vendor_id, product_id, quantity, unit_price,
       commission_amount, total_amount, shipping_address, question_id, suggestion_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderNumber,
        customerId,
        product.vendor_id,
        product_id,
        quantity,
        product.price,
        commissionAmount,
        totalAmount,
        shipping_address || null,
        question_id || null,
        suggestion_id || null,
      ],
    );

    await pool.query(`UPDATE products SET stock = stock - ? WHERE id=?`, [
      quantity,
      product_id,
    ]);

    await sendNotification({
      userId: product.vendor_id,
      title: "New Order Received",
      message: `Order ${orderNumber} placed for ${product.name} (qty: ${quantity})`,
      referenceType: "order",
      referenceId: insert.insertId,
    });

    const [order] = await pool.query(`SELECT * FROM orders WHERE id=?`, [
      insert.insertId,
    ]);

    res.status(201).json({
      message: `Order placed successfull`,
      success: true,
      data: order[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { role, id: userId } = req?.user;
    const { id } = req.params;
    const { status } = req?.body;

    if (!["dispatched", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Use dispatched, delivered, or cancelled",
        success: false,
      });
    }

    const [orders] = await pool.query(`SELECT * FROM orders WHERE id=?`, [id]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    if (role === "Vendor" && order.vendor_id !== userId) {
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

    let dispatched_at = order.dispatched_at;
    let delivered_at = order.delivered_at;

    if (status === "dispatched") dispatched_at = new Date();
    if (status === "delivered") delivered_at = new Date();

    await pool.query(
      `
      UPDATE orders
      SET status=?, dispatched_at=?, delivered_at=?
      WHERE id=?
      `,
      [status, dispatched_at, delivered_at, id],
    );

    await sendNotification({
      userId: order.customer_id,
      title: "Order Status Updated",
      message: `Your order ${order.order_number} is now ${status}`,
      referenceType: "order",
      referenceId: parseInt(id),
    });

    const [updated] = await pool.query(`SELECT * FROM orders WHERE id=?`, [id]);

    res.status(200).json({
      message: "Order status updated successfully",
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

export const getMyOrders = async (req, res) => {
  try {
    const { role, id: userId } = req?.user;

    let query;
    let params;

    if (role === "Vendor") {
      query = `
        SELECT o.*, p.name AS product_name
        FROM orders o
        JOIN products p ON p.id = o.product_id
        WHERE o.vendor_id=?
        ORDER BY o.created_at DESC
      `;
      params = [userId];
    } else if (["Farmer", "Customer"].includes(role)) {
      query = `
        SELECT o.*, p.name AS product_name
        FROM orders o
        JOIN products p ON p.id = o.product_id
        WHERE o.customer_id=?
        ORDER BY o.created_at DESC
      `;
      params = [userId];
    } else if (role === "Admin") {
      query = `
        SELECT o.*, p.name AS product_name
        FROM orders o
        JOIN products p ON p.id = o.product_id
        ORDER BY o.created_at DESC
      `;
      params = [];
    } else {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      message: "Orders fetch successfull",
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req?.user;

    const [rows] = await pool.query(
      `
      SELECT o.*, p.name AS product_name, p.images
      FROM orders o
      JOIN products p ON p.id = o.product_id
      WHERE o.id=?
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = rows[0];

    if (
      role !== "Admin" &&
      order.customer_id !== userId &&
      order.vendor_id !== userId
    ) {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetch successfull",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};
