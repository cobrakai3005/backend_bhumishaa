import pool from "../confiq/mysqldb.js";
import cloudinary from "../confiq/cloudinary.js";

function getPublicId(url) {
  const parts = url.split("/");
  const fileWithExt = parts[parts.length - 1];
  const publicId = fileWithExt.split(".")[0];
  return (
    parts.slice(parts.indexOf("upload") + 1, -1).join("/") + "/" + publicId
  );
}
// export async function createGuide(req, res) {
//   try {
//     console.log("FILES:", req.files);
//     console.log(req.body.guides);
//     console.log(typeof req.body.guides);
//     // return res.json("hii");
//     const { crop_detail_id } = req.body;

//     // 1. Validate required field
//     if (!crop_detail_id) {
//       return res.status(400).json({
//         success: false,
//         message: "crop_detail_id is required",
//       });
//     }

//     // 2. Parse guides safely
//     let guides = [];
//     try {
//       guides = JSON.parse(req.body.guides || "[]");
//     } catch (err) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid guides JSON format",
//       });
//     }

//     const files = req.files || [];

//     // 3. Group files by fieldname (Cloudinary URLs)
//     const fileMap = files.reduce((acc, file) => {
//       if (!file.fieldname) return acc;

//       if (!acc[file.fieldname]) {
//         acc[file.fieldname] = [];
//       }

//       acc[file.fieldname].push(file.path); // Cloudinary URL
//       return acc;
//     }, {});

//     console.log("FILE MAP:", fileMap);

//     // 4. Build dynamic crop guide object
//     const crop_guides = guides.reduce((acc, item) => {
//       if (!item.key) return acc;

//       acc[item.key] = {
//         title: item.title || "",
//         images: fileMap[item.key] || [],
//       };

//       return acc;
//     }, {});

//     // 5. Save to database
//     const [result] = await pool.query(
//       `INSERT INTO crop_guide (crop_detail_id, crop_guides)
//        VALUES (?, ?)`,
//       [crop_detail_id, JSON.stringify(crop_guides)],
//     );

//     // 6. Response
//     return res.status(201).json({
//       success: true,
//       message: "Crop guide created successfully",
//       id: result.insertId,
//       data: crop_guides,
//     });
//   } catch (err) {
//     console.error("CREATE GUIDE ERROR:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// }
export async function createGuide(req, res) {
  try {
    console.log("FILES:", req.files);
    console.log(req.body.guides);
    console.log(typeof req.body.guides);
    // return res.json("hii");
    const { crop_detail_id } = req.body;

    // 1. Validate required field
    if (!crop_detail_id) {
      return res.status(400).json({
        success: false,
        message: "crop_detail_id is required",
      });
    }

    // 2. Parse guides safely
    let guides = [];
    try {
      guides = JSON.parse(req.body.guides || "[]");
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid guides JSON format",
      });
    }

    const files = req.files || [];

    // 3. Group files by fieldname (Cloudinary URLs)
    const fileMap = files.reduce((acc, file) => {
      if (!file.fieldname) return acc;

      if (!acc[file.fieldname]) {
        acc[file.fieldname] = [];
      }

      acc[file.fieldname].push(file.path); // Cloudinary URL
      return acc;
    }, {});

    console.log("FILE MAP:", fileMap);

    // 4. Build dynamic crop guide object
    const crop_guides = guides.reduce((acc, item) => {
      if (!item.key) return acc;

      acc[item.key] = {
        title: item.title || "",
        images: fileMap[item.key] || [],
      };

      return acc;
    }, {});

    // 5. Save to database
    const [result] = await pool.query(
      `INSERT INTO crop_guide (crop_detail_id, crop_guides)
       VALUES (?, ?)`,
      [crop_detail_id, JSON.stringify(crop_guides)],
    );

    // 6. Response
    return res.status(201).json({
      success: true,
      message: "Crop guide created successfully",
      id: result.insertId,
      data: crop_guides,
    });
  } catch (err) {
    console.error("CREATE GUIDE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
}

// export async function createGuide(req, res) {
//   const connection = await pool.getConnection();

//   try {
//     await connection.beginTransaction();

//     console.log(req.body);

//     const { crop_detail_id } = req.body;

//     if (!crop_detail_id) {
//       return res.status(400).json({
//         success: false,
//         message: "crop_detail_id is required",
//       });
//     }

//     // parse guides ONLY ONCE
//     const guides = JSON.parse(req.body.guides || "[]");

//     const files = req.files || [];

//     // map files by fieldname (IMPORTANT)
//     const fileMap = files.reduce((acc, file) => {
//       if (!acc[file.fieldname]) acc[file.fieldname] = [];
//       acc[file.fieldname].push(file.path);
//       return acc;
//     }, {});

//     // create parent
//     const [result] = await connection.query(
//       `INSERT INTO crop_guide2 (crop_detail_id) VALUES (?)`,
//       [crop_detail_id],
//     );

//     const cropGuideId = result.insertId;

//     // insert each guide
//     for (const item of guides) {
//       if (!item.key) continue;

//       await connection.query(
//         `
//         INSERT INTO crop_guide_items (
//           crop_guide_id,
//           guide_key,
//           title_en,
//           title_hi,
//           title_mr,
//           description_en,
//           description_hi,
//           description_mr,
//           images
//         )
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `,
//         [
//           cropGuideId,
//           item.key,

//           item.title_en || null,
//           item.title_hi || null,
//           item.title_mr || null,

//           item.description_en || null,
//           item.description_hi || null,
//           item.description_mr || null,

//           JSON.stringify(fileMap[item.key] || []), // ✅ KEY MATCHING
//         ],
//       );
//     }

//     await connection.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Crop guide created successfully",
//       crop_guide_id: cropGuideId,
//     });
//   } catch (err) {
//     await connection.rollback();

//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   } finally {
//     connection.release();
//   }
// }

// export async function getAllGuides(req, res) {
//   try {
//     const { search = "", lang = "en" } = req.query;

//     const [rows] = await pool.query(`
//       SELECT *
//       FROM crop_guide
//       ORDER BY id DESC
//     `);

//     let filteredRows = rows;

//     // Search in selected language title
//     if (search) {
//       filteredRows = rows.filter((row) => {
//         return Object.values(row.crop_guides || {}).some((guide) => {
//           const title =
//             typeof guide.title === "object" ? guide.title?.[lang] : guide.title;

//           return title?.toLowerCase().includes(search.toLowerCase());
//         });
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       count: filteredRows.length,
//       data: filteredRows,
//     });
//   } catch (error) {
//     console.error("GET GUIDES ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch guides",
//       error: error.message,
//     });
//   }
// }

export async function getAllGuides(req, res) {
  try {
    const lang = req.query.lang || "en";
    const search = req.query.search || "";
    const [rows] = await pool.query(
      `
  SELECT 
    cg.id AS crop_guide_id,
    cgi.id AS item_id,
    cgi.guide_key,
    cgi.title_en,
    cgi.title_hi,
    cgi.title_mr,
    cgi.images
  FROM crop_guide2 cg
  JOIN crop_guide_items cgi 
    ON cg.id = cgi.crop_guide_id
  WHERE 
    cgi.title_${lang} LIKE ?
  ORDER BY cg.id DESC
  `,
      [`%${search}%`],
    );

    let filteredRows = rows;

    if (search) {
      filteredRows = rows.filter((item) => {
        const title = item[`title_${lang}`] || "";
        return title.toLowerCase().includes(search.toLowerCase());
      });
    }

    // group result
    const grouped = {};

    for (const row of filteredRows) {
      if (!grouped[row.crop_guide_id]) {
        grouped[row.crop_guide_id] = {
          id: row.crop_guide_id,
          items: [],
        };
      }

      grouped[row.crop_guide_id].items.push({
        id: row.item_id,
        key: row.guide_key,
        title_en: row.title_en,
        title_hi: row.title_hi,
        title_mr: row.title_mr,

        images: (() => {
          try {
            return typeof row.images === "string"
              ? JSON.parse(row.images)
              : row.images || [];
          } catch (e) {
            return [];
          }
        })(),
      });
    }

    return res.status(200).json({
      success: true,
      count: Object.keys(grouped).length,
      data: Object.values(grouped),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getGuideById(req, res) {
  const { id } = req.params;

  const [rows] = await pool.query(`SELECT * FROM crop_guide WHERE id = ?`, [
    id,
  ]);

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Guide not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: rows[0],
  });
}

export async function updateGuide(req, res) {
  try {
    const { id } = req.params;
    const { crop_detail_id, crop_guides } = req.body;

    const files = req.files || [];

    // 1. Get existing record
    const [existing] = await pool.query(
      `SELECT * FROM crop_guide WHERE id = ?`,
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    // 2. Parse old data
    const oldData =
      typeof existing[0].crop_guides === "string"
        ? JSON.parse(existing[0].crop_guides)
        : existing[0].crop_guides;

    // 3. Parse new incoming data
    const newData =
      typeof crop_guides === "string"
        ? JSON.parse(crop_guides)
        : crop_guides || oldData;

    // 4. Convert req.files → fileMap (IMPORTANT FIX)
    const fileMap = files.reduce((acc, file) => {
      if (!acc[file.fieldname]) acc[file.fieldname] = [];
      acc[file.fieldname].push(file.path);
      return acc;
    }, {});

    // 5. Merge and  replace logic
    for (const key in newData) {
      if (fileMap[key] && fileMap[key].length > 0) {
        // 🧹 delete old images from cloudinary
        if (oldData[key]?.images?.length) {
          for (const url of oldData[key].images) {
            try {
              const publicId = getPublicId(url);
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.log("Delete error:", err.message);
            }
          }
        }

        //  replace with new images
        newData[key].images = fileMap[key];
      } else {
        // keep old images
        newData[key].images = oldData[key]?.images || [];
      }
    }

    // 6. Build update query
    const fields = [];
    const values = [];

    if (crop_detail_id) {
      fields.push("crop_detail_id = ?");
      values.push(crop_detail_id);
    }

    fields.push("crop_guides = ?");
    values.push(JSON.stringify(newData));

    values.push(id);

    const query = `
      UPDATE crop_guide
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    await pool.query(query, values);

    return res.status(200).json({
      success: true,
      message: "Guide updated successfully",
      data: newData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function deleteGuide(req, res) {
  const { id } = req.params;

  const [existing] = await pool.query(`SELECT * FROM crop_guide WHERE id = ?`, [
    id,
  ]);

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Guide not found",
    });
  }

  const guide = existing[0].crop_guides;

  let parsedGuide = typeof guide === "string" ? JSON.parse(guide) : guide;

  // 🔥 Collect all image URLs
  const allImages = [];

  Object.values(parsedGuide).forEach((section) => {
    if (section.images && Array.isArray(section.images)) {
      allImages.push(...section.images);
    }
  });

  // 🔥 Delete from Cloudinary
  for (const url of allImages) {
    try {
      const publicId = getPublicId(url);
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.log("Cloudinary delete error:", err.message);
    }
  }

  // 🔥 Delete from DB
  await pool.query(`DELETE FROM crop_guide WHERE id = ?`, [id]);

  return res.status(200).json({
    success: true,
    message: "Guide and images deleted successfully",
  });
}
