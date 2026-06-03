import cron from "node-cron";
import pool from "../confiq/mysqldb.js";
import { sendNotification } from "../utils/notify.js";

cron.schedule("*/30 * * * *", async () => {
  try {
    const [questions] = await pool.query(`
        SELECT id, question, question_at
        FROM crops_question
        WHERE answer IS NULL
        AND (is_deleted = 0 OR is_deleted IS NULL)
        AND (alert_sent = 0 OR alert_sent IS NULL)
        AND question_at <= DATE_SUB(NOW(), INTERVAL 2 HOUR)
    `);

    if (questions.length === 0) return;

    const [admins] = await pool.query(`
      SELECT id FROM users WHERE role = 'Admin'
    `);

    for (const question of questions) {
      for (const admin of admins) {
        await sendNotification({
          userId: admin.id,
          title: "Pending Question Alert",
          message: `Question #${question.id} has not been answered within 2 hours.`,
          referenceType: "crops_question",
          referenceId: question.id,
        });
      }

      await pool.query(
        `UPDATE crops_question SET alert_sent = TRUE WHERE id = ?`,
        [question.id],
      );
    }

    console.log(`Escalation: ${questions.length} unanswered question(s)`);
  } catch (err) {
    console.error(err);
  }
});
