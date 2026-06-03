import express from "express";
const router = express.Router();
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createGuide,
  deleteGuide,
  getAllGuides,
  getGuideById,
  updateGuide,
} from "../controllers/crop_guide.js";
import {
  createGuideHeading,
  getAllGuideHeadings,
  deleteHeading,
} from "../controllers/guide_heaing.controller.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../confiq/cloudinary.js";
import multer from "multer";
import pool from "../confiq/mysqldb.js";
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop();

    return {
      resource_type: "auto",
      folder: "my-app-media",
      public_id: `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      format: ext,
    };
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only images and mp4 videos allowed"));
    }

    cb(null, true);
  },
});
// router.post("/create-guide", authMiddleware, upload.any(), createGuide);
// router.get("/getAll-crop_guides", authMiddleware, getAllGuides);
// router.get("/:id", authMiddleware, getGuideById);
// router.put("/update-crop_guide/:id", authMiddleware, upload.any(), updateGuide);
// router.delete("/delete_crop_guide/:id", authMiddleware, deleteGuide);

// Heading

router.post("/create_headings", createGuideHeading);
router.delete("/delete_headings/:id", deleteHeading);
router.get("/get_headings_all", getAllGuideHeadings);

// Guide Parent
router.post("/guide_parent", async (req, res) => {
  const { crop_guide_heading_id, crop_id } = req.body;
  console.log(req.body);

  // Validation
  if (!crop_guide_heading_id || !crop_id) {
    return res.status(400).json({
      success: false,
      message: "crop_guide_heading_id and crop_id are required",
    });
  }

  // Check duplicate heading
  const [existingCropHeading] = await pool.query(
    `
      SELECT id
      FROM crop_guide_heading
      WHERE id = ?
      limit 1
      `,
    [crop_guide_heading_id],
  );
  const [existingCrop] = await pool.query(
    `
      SELECT id
      FROM crops
      WHERE id = ?
      `,
    [crop_id],
  );
  console.log(existingCropHeading, existingCrop);

  if (existingCropHeading.length === 0 || existingCrop.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Crop or Heading not found",
    });
  }

  // Insert heading
  const [result] = await pool.query(
    `
      INSERT INTO crop_guide_parent
       (crop_guide_heading_id, crop_id)
      VALUES (?, ?)
      `,
    [crop_guide_heading_id, crop_id],
  );
  return res.status(201).json({
    success: true,
    message: "Guide parent created successfully",
    data: result.insertId,
  });
});
router.get("  /:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check parent exists
    const [parent] = await pool.query(
      `
      SELECT 
        p.id,
        p.crop_id,
        c.name AS crop_name,
        p.crop_guide_heading_id,
        h.title AS heading_title,
        p.created_at,
        p.updated_at

      FROM crop_guide_parent p

      JOIN crops c
        ON c.id = p.crop_id

      JOIN crop_guide_heading h
        ON h.id = p.crop_guide_heading_id

      WHERE p.id = ?
      `,
      [id],
    );

    if (parent.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Guide parent not found",
      });
    }

    // Get details
    const [details] = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        media_url,
        created_at,
        updated_at

      FROM crop_guide_details

      WHERE crop_guide_parent_id = ?
      `,
      [id],
    );

    return res.status(200).json({
      success: true,
      data: {
        ...parent[0],
        details,
      },
    });
  } catch (error) {
    console.error("Get Guide Parent Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/guide_parents", async (req, res) => {
  try {
    const [parents] = await pool.query(
      `
      SELECT
        p.id AS parent_id,
        p.crop_guide_heading_id,
        h.title AS heading_title,
        p.crop_id,
        c.name AS crop_name
      FROM crop_guide_parent p
      JOIN crop_guide_heading h ON h.id = p.crop_guide_heading_id
      JOIN crops c ON c.id = p.crop_id
      ORDER BY h.title, c.name
      `,
    );

    return res.status(200).json({
      success: true,
      data: parents,
    });
  } catch (error) {
    console.error("Get Guide Parents Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.delete("/delete_guide_parent/:id", async (req, res) => {
  console.log("DELETNG GUIDE PARENT", req.params);
  const id = Number(req.params.id);
  try {
    const [existingParent] = await pool.query(
      `
      select id
      from crop_guide_parent
      where id = ?
      `,
      [id],
    );

    if (existingParent.length === 0) {
      return res
        .status(404)
        .json({ success: false, messagee: "Crop Guide parent not found" });
    }
    await pool.query(
      `
        update  crop_guide_parent
        set is_deleted = true
        where id = ?
      `,
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Guide parent deleted successfully",
    });
  } catch (error) {
    console.log("DELETE GUIDE PARENT Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
// Guide Details

// router.post("/create_guide_details", upload.any(), async (req, res) => {
//   try {
//     const { title, description, crop_guide_parent_id } = req.body;

//     // Validation
//     if (!crop_guide_parent_id) {
//       return res.status(400).json({
//         success: false,
//         message: "crop_guide_parent_id is required",
//       });
//     }

//     // Check parent exists
//     const [parent] = await pool.query(
//       `
//       SELECT id
//       FROM crop_guide_parent
//       WHERE id = ?
//       `,
//       [crop_guide_parent_id],
//     );

//     if (parent.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Guide parent not found",
//       });
//     }

//     // Upload files
//     let media_url = [];

//     if (req.files && req.files.length > 0) {
//       media_url = req.files.map((file) => ({
//         file_name: file.filename,
//         file_url: file.path,
//       }));
//     }

//     // Insert detail
//     const [result] = await pool.query(
//       `
//       INSERT INTO crop_guide_details
//       (
//         title,
//         description,
//         media_url,
//         crop_guide_parent_id
//       )
//       VALUES (?, ?, ?, ?)
//       `,
//       [
//         title || null,
//         description || null,
//         JSON.stringify(media_url),
//         crop_guide_parent_id,
//       ],
//     );

//     // Get inserted detail
//     const [detail] = await pool.query(
//       `
//       SELECT *
//       FROM crop_guide_details
//       WHERE id = ?
//       `,
//       [result.insertId],
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Guide details created successfully",
//       data: detail[0],
//     });
//   } catch (error) {
//     console.error("Create Guide Details Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// });

router.post("/create_guide_details", upload.any(), async (req, res) => {
  try {
    const { crop_guide_parent_id, details } = req.body;

    // Validation
    if (!crop_guide_parent_id) {
      return res.status(400).json({
        success: false,
        message: "crop_guide_parent_id is required",
      });
    }
    console.log(req.files);

    // Parse details if stringified
    let parsedDetails = details;

    if (typeof details === "string") {
      parsedDetails = JSON.parse(details);
    }

    if (!parsedDetails || !Array.isArray(parsedDetails)) {
      return res.status(400).json({
        success: false,
        message: "details must be an array",
      });
    }

    // Check parent exists
    const [parent] = await pool.query(
      `
      SELECT id
      FROM crop_guide_parent
      WHERE id = ?
      `,
      [crop_guide_parent_id],
    );

    if (parent.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Guide parent not found",
      });
    }

    // Uploaded files
    const files = req.files || [];

    /*
      FRONTEND FORMAT:
      details[0]
      details[1]

      files:
      detail_0
      detail_1
      detail_2

      meaning:
      detail_0 => files for first detail
      detail_1 => files for second detail
    */

    const insertValues = parsedDetails.map((item, index) => {
      // Match files by fieldname
      const matchedFiles = files.filter(
        (file) => file.fieldname === `detail_${index}`,
      );

      // Media array
      const media_url = matchedFiles.map((file) => ({
        public_id: file.filename,
        file_url: file.path,
      }));

      return [
        item.title || null,
        item.description || null,
        JSON.stringify(media_url),
        crop_guide_parent_id,
      ];
    });

    // Bulk insert
    await pool.query(
      `
      INSERT INTO crop_guide_details
      (
        title,
        description,
        media_url,
        crop_guide_parent_id
      )
      VALUES ?
      `,
      [insertValues],
    );

    return res.status(201).json({
      success: true,
      message: "Guide details created successfully",
    });
  } catch (error) {
    console.error("Create Guide Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/guide_details/:parentId", async (req, res) => {
  try {
    const { parentId } = req.params;

    // Check parent exists
    const [parent] = await pool.query(
      `
      SELECT 
        p.id,
        p.crop_id,
        c.name AS crop_name,
        h.title AS heading_title

      FROM crop_guide_parent p

      JOIN crops c
        ON c.id = p.crop_id

      JOIN crop_guide_heading h
        ON h.id = p.crop_guide_heading_id

      WHERE p.id = ?
      `,
      [parentId],
    );

    if (parent.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Guide parent not found",
      });
    }

    // Get details
    const [details] = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        media_url,
        created_at,
        updated_at

      FROM crop_guide_details

      WHERE crop_guide_parent_id = ?

      ORDER BY id DESC
      `,
      [parentId],
    );

    // Parse media JSON
    const formattedDetails = details.map((item) => {
      let media_url = [];
      if (item.media_url) {
        try {
          media_url =
            typeof item.media_url === "string"
              ? JSON.parse(item.media_url)
              : item.media_url;
        } catch {
          media_url = [item.media_url];
        }
      }
      return { ...item, media_url };
    });

    return res.status(200).json({
      success: true,
      parent: parent[0],
      count: formattedDetails.length,
      data: formattedDetails,
    });
  } catch (error) {
    console.error("Get Guide Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
router.get("/guide_details", async (req, res) => {
  try {
    const [details] = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        media_url,
        created_at,
        updated_at

      FROM crop_guide_details

      ORDER BY id DESC
      `,
    );

    // Parse media JSON
    const formattedDetails = details.map((item) => {
      let media_url = [];
      if (item.media_url) {
        try {
          media_url =
            typeof item.media_url === "string"
              ? JSON.parse(item.media_url)
              : item.media_url;
        } catch {
          media_url = [item.media_url];
        }
      }
      return { ...item, media_url };
    });

    return res.status(200).json({
      success: true,
      count: formattedDetails.length,
      data: formattedDetails,
    });
  } catch (error) {
    console.error("Get Guide Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
// router.put("/update_guide_details/:id", upload.any(), async (req, res) => {
//   try {
//     const { id } = req.params;

//     const { title, description } = req.body;

//     // Existing record
//     const [existing] = await pool.query(
//       `
//       SELECT *
//       FROM crop_guide_details
//       WHERE id = ?
//       `,
//       [id],
//     );

//     if (existing.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Guide details not found",
//       });
//     }

//     // Old media
//     const oldMedia = existing[0].media_url
//       ? JSON.parse(existing[0].media_url)
//       : [];

//     // Delete old cloudinary images
//     for (const img of oldMedia) {
//       if (img.public_id) {
//         await cloudinary.uploader.destroy(img.public_id);
//       }
//     }

//     // Upload new images
//     let media_url = [];

//     if (req.files && req.files.length > 0) {
//       media_url = req.files.map((file) => ({
//         public_id: file.filename,
//         file_url: file.path,
//       }));
//     }

//     // Update DB
//     await pool.query(
//       `
//       UPDATE crop_guide_details
//       SET
//         title = ?,
//         description = ?,
//         media_url = ?
//       WHERE id = ?
//       `,
//       [
//         title || existing[0].title,
//         description || existing[0].description,
//         JSON.stringify(media_url),
//         id,
//       ],
//     );

//     // Get updated record
//     const [updated] = await pool.query(
//       `
//       SELECT *
//       FROM crop_guide_details
//       WHERE id = ?
//       `,
//       [id],
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Updated successfully",
//       data: {
//         ...updated[0],
//         media_url: updated[0].media_url ? JSON.parse(updated[0].media_url) : [],
//       },
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });

router.put("/update_guide_details/:id", upload.any(), async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description } = req.body;

    // Existing detail
    const [existing] = await pool.query(
      `
        SELECT *
        FROM crop_guide_details
        WHERE id = ?
        `,
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Guide detail not found",
      });
    }

    // Old media
    let media_url = existing[0].media_url
      ? JSON.parse(existing[0].media_url)
      : [];

    // New uploaded files
    const files = req.files || [];

    // Append new images
    if (files.length > 0) {
      const newMedia = files.map((file) => ({
        public_id: file.filename,
        file_url: file.path,
      }));

      media_url = [...media_url, ...newMedia];
    }

    // Update DB
    await pool.query(
      `
        UPDATE crop_guide_details
        SET
          title = ?,
          description = ?,
          media_url = ?
        WHERE id = ?
        `,
      [
        title || existing[0].title,
        description || existing[0].description,
        JSON.stringify(media_url),
        id,
      ],
    );

    // Updated data
    const [updated] = await pool.query(
      `
        SELECT *
        FROM crop_guide_details
        WHERE id = ?
        `,
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Guide details updated successfully",
      data: {
        ...updated[0],
        media_url: updated[0].media_url ? JSON.parse(updated[0].media_url) : [],
      },
    });
  } catch (error) {
    console.error("Update Guide Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.delete("/delete_guide_image/:detailId", async (req, res) => {
  try {
    const { detailId } = req.params;

    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: "public_id is required",
      });
    }

    // Existing detail
    const [existing] = await pool.query(
      `
      SELECT *
      FROM crop_guide_details
      WHERE id = ?
      `,
      [detailId],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Guide detail not found",
      });
    }

    // Existing media
    let media_url = existing[0].media_url
      ? JSON.parse(existing[0].media_url)
      : [];

    // Find image exists
    const imageExists = media_url.find((img) => img.public_id === public_id);

    if (!imageExists) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete from cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Remove from array
    media_url = media_url.filter((img) => img.public_id !== public_id);

    // Update DB
    await pool.query(
      `
      UPDATE crop_guide_details
      SET media_url = ?
      WHERE id = ?
      `,
      [JSON.stringify(media_url), detailId],
    );

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      media_url,
    });
  } catch (error) {
    console.error("Delete Guide Image Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
router.delete("/delete_guide_details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      `
      SELECT *
      FROM crop_guide_details
      WHERE id = ?
      `,
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Guide details not found",
      });
    }

    // Delete cloudinary images
    // const media = existing[0].media_url
    //   ? JSON.parse(existing[0].media_url)
    //   : [];

    // for (const img of media) {
    //   if (img.public_id) {
    //     await cloudinary.uploader.destroy(img.public_id);
    //   }
    // }

    await pool.query(
      `
        update  crop_guide_details
        set is_deleted = true
        where id = ?
      `,
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Guide details deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
