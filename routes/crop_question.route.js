import express from "express";
import pool from "../confiq/mysqldb.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import { sendNotification } from "../utils/notify.js";

const router = express.Router();

router.post(
  "/create_question",

  upload.single("image_video"),
  authMiddleware,
  async (req, res) => {
    // Handle create question logic here

    const { question, crop_details_id, description, tag } = req.body;
    const image_video = req.file ? req.file.path : null;
    const user_id = req.user.id;
    console.log(req.file);
    console.table([question, crop_details_id, description, tag]);

    let imageVideoJson = JSON.stringify([]);

    if (req.file) {
      imageVideoJson = JSON.stringify([req.file.path]);
    }

    try {
      const [result] = await pool.query(
        "INSERT INTO crops_question (question, crop_details_id, image_video, description, user_id, tag) VALUES (?, ?, ?, ?, ?, ?)",
        [
          question,
          crop_details_id,
          imageVideoJson,
          description,
          user_id,
          tag ? JSON.stringify(tag) : null,
        ],
      );
      res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: { id: result.insertId },
      });
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

router.get("/get_all", authMiddleware, async (req, res) => {
  try {
    const [exists] = await pool.query(`
        select * from  crops_question
        
        `);

    return res.status(200).json({
      success: true,
      data: exists,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Internal Server Eror",
    });
  }
});

router.delete("/delete_question/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [exsistingQ] = await pool.query(
      `
    
    select id from crops_question
    where id = ?
    
    `,
      [id],
    );

    if (exsistingQ.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not Found",
      });
    }

    await pool.query(
      `
        update crops_question
        set is_deleted = true
        where id = ?        
        `,
      [id],
    );
    return res.status(200).json({
      success: false,
      message: "Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Question not Found",
    });
  }
});

router.put("/create_answer/:questionId", authMiddleware, async (req, res) => {
  const { questionId } = req.params;
  const { answer } = req.body;

  const { role } = req?.user;
  console.log(role);
  if (role !== "Admin") {
    return res.status(400).json({
      message: "You are not Allowed to Perform this Task",
      success: false,
    });
  }

  try {
    const [exsistingQuestion] = await pool.query(
      `
        select id  from crops_question
        where id = ?
        `,
      [questionId],
    );

    if (exsistingQuestion.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Questions not Found",
      });
    }

    const [questionRow] = await pool.query(
      `SELECT user_id FROM crops_question WHERE id = ?`,
      [questionId],
    );

    await pool.query(
      `
      UPDATE crops_question
      SET answer = ?, answer_at = ?, expert_id = ?
        where id = ?
        `,
      [answer, new Date(Date.now()), req.user.id, questionId],
    );

    if (questionRow[0]?.user_id) {
      await sendNotification({
        userId: questionRow[0].user_id,
        title: "Your question was answered",
        message: "An expert has responded to your crop question.",
        referenceType: "crops_question",
        referenceId: parseInt(questionId, 10),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Answer added successfully",
    });
  } catch (error) {
    console.error("Error creating answer:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
