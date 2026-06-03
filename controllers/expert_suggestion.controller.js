import pool from "../confiq/mysqldb.js";
import { sendNotification } from "../utils/notify.js";

export const createSuggestion = async (req, res) => {
  try {
    const { role, id: expertId } = req?.user;

    if (role !== "Expert") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const {
      question_id,
      crop_id,
      suggestion_text,
      pesticide_name,
      product_ids,
    } = req?.body;

    if (!suggestion_text) {
      return res.status(400).json({
        message: "suggestion_text is required",
        success: false,
      });
    }

    const productIdsJson = product_ids
      ? JSON.stringify(
          Array.isArray(product_ids) ? product_ids : JSON.parse(product_ids),
        )
      : null;

    const [insert] = await pool.query(
      `
      INSERT INTO expert_suggestions
      (question_id, crop_id, expert_id, suggestion_text, pesticide_name, product_ids)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        question_id || null,
        crop_id || null,
        expertId,
        suggestion_text,
        pesticide_name || null,
        productIdsJson,
      ],
    );

    if (question_id) {
      const [questions] = await pool.query(
        `SELECT user_id FROM crops_question WHERE id=?`,
        [question_id],
      );

      if (questions.length > 0) {
        await sendNotification({
          userId: questions[0].user_id,
          title: "Expert Answered Your Question",
          message: "An expert has provided a crop suggestion for your question",
          referenceType: "expert_suggestion",
          referenceId: insert.insertId,
        });
      }
    }

    const [suggestion] = await pool.query(
      `SELECT * FROM expert_suggestions WHERE id=?`,
      [insert.insertId],
    );

    res.status(201).json({
      message: `Expert suggestion Created successfull`,
      success: true,
      data: suggestion[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const [suggestions] = await pool.query(
      `SELECT * FROM expert_suggestions WHERE id=?`,
      [id],
    );

    if (suggestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Suggestion not found",
      });
    }

    const suggestion = suggestions[0];

    if (!suggestion.product_ids) {
      return res.status(200).json({
        success: true,
        message: "No related products linked",
        data: [],
      });
    }

    const productIds = JSON.parse(suggestion.product_ids);
    if (!productIds.length) {
      return res.status(200).json({
        success: true,
        message: "No related products linked",
        data: [],
      });
    }

    const placeholders = productIds.map(() => "?").join(",");
    const [products] = await pool.query(
      `
      SELECT p.*, pc.commission_type, pc.commission_value
      FROM products p
      LEFT JOIN product_commissions pc ON pc.product_id = p.id
      WHERE p.id IN (${placeholders}) AND p.is_delete = FALSE
      `,
      productIds,
    );

    res.status(200).json({
      success: true,
      message: "Related products fetch successfull",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getSuggestionsByQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT es.*, u.username AS expert_name
      FROM expert_suggestions es
      JOIN users u ON u.id = es.expert_id
      WHERE es.question_id=?
      ORDER BY es.created_at DESC
      `,
      [question_id],
    );

    res.status(200).json({
      success: true,
      message: "Suggestions fetch successfull",
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};
