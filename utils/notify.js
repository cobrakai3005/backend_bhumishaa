import pool from "../confiq/mysqldb.js";

export const sendNotification = async ({
  userId,
  title,
  message,
  referenceType = null,
  referenceId = null,
}) => {
  await pool.query(
    `
    INSERT INTO notifications (user_id, title, message)
    VALUES (?, ?, ?)
    `,
    [userId, title, message],
  );

  const channels = ["email", "sms", "in_app"];

  for (const channel of channels) {
    await pool.query(
      `
      INSERT INTO notification_logs
      (user_id, channel, title, message, reference_type, reference_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'sent')
      `,
      [userId, channel, title, message, referenceType, referenceId],
    );

    if (channel === "email") {
      console.log(`[EMAIL] to user ${userId}: ${title} - ${message}`);
    }
    if (channel === "sms") {
      console.log(`[SMS] to user ${userId}: ${title} - ${message}`);
    }
  }
};
