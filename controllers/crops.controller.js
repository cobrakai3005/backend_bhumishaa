// import pool from "../confiq/mysqldb.js";

// import { v2 as cloudinary } from "cloudinary";
// export const createCrops = async (req, res) => {
//     try {

//         const { role } = req?.user

//         console.log(role);

//         if (role !== "Admin") {
//             return res.status(400).json({
//                 message: "You are not Allowed to Perform this Task",
//                 success: false
//             })
//         }

//         console.log("ASDFGHJKL", req?.body, "QWERTYUIOP");

//         const { name, description } = req?.body
//         const crop_theme_image = req.file?.path || null;
//         const crop_theme_image_id = req.file?.filename || null;

//         if (!name || !description || !crop_theme_image || !crop_theme_image_id) {
//             return res.status(400).json({
//                 message: "All fields are required",
//                 success: false
//             })
//         }

//         const insertCrops = await pool.query("INSERT INTO crops(name,decription,crop_theme_image,crop_theme_image_id) VALUES($1,$2,$3,$4) RETURNING *", [name, description, crop_theme_image, crop_theme_image_id])

//         res.status(201).json({
//             message: `Crops Created successfull`,
//             success: true,
//             data: insertCrops.rows[0]
//         })

//     } catch (error) {
//         return res.status(500).json({
//             message: `Server Error ${error.message}`,
//             success: false,
//         });
//     }
// }

// export const getAllCrops = async (req, res) => {
//     try {

//         const {
//             limit = 10,
//             page = 1,
//             status = false
//         } = req.query;

//         const limitNumber = parseInt(limit)
//         const pageNumber = parseInt(page)

//         const offset = (pageNumber - 1) * limitNumber;

//         const getAllCrops = await pool.query("SELECT *, COUNT(*) OVER() AS total_count FROM crops WHERE is_delete=$1 ORDER BY id LIMIT $2 OFFSET $3", [status, limitNumber, offset])

//         const totalCount = getAllCrops.rows.length > 0
//             ? getAllCrops.rows[0].total_count
//             : 0;

//         res.status(200).json({
//             success: true,
//             message: "Crop Data fetch successfull",
//             page,
//             limit,
//             totalRecords: totalCount,
//             totalPages: Math.ceil(totalCount / limit),
//             data: getAllCrops.rows
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: `Server Error ${error.message}`,
//             success: false,
//         });
//     }
// }

// export const updateCrops = async (req, res) => {
//     try {
//         const { role } = req?.user;

//         if (role !== "Admin") {
//             return res.status(400).json({
//                 message: "You are not Allowed to Perform this Task",
//                 success: false
//             });
//         }

//         const { id } = req.params;
//         const { name, description } = req.body;

//         // Image optional rakho
//         const newImage = req.file?.path;
//         const newImageId = req.file?.filename;

//         // Name aur description hi required
//         if (!name || !description) {
//             return res.status(400).json({
//                 message: "Name and Description are required",
//                 success: false
//             });
//         }

//         // Old crop data fetch
//         const getCropById = await pool.query(
//             "SELECT * FROM crops WHERE id=$1",
//             [id]
//         );

//         if (getCropById.rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Crop not found"
//             });
//         }

//         const oldCrop = getCropById.rows[0];

//         let crop_theme_image = oldCrop.crop_theme_image;
//         let crop_theme_image_id = oldCrop.crop_theme_image_id;

//         // Agar user ne nayi image bheji hai
//         if (newImage && newImageId) {

//             // Purani image delete karo
//             if (oldCrop.crop_theme_image_id) {
//                 await cloudinary.uploader.destroy(
//                     oldCrop.crop_theme_image_id
//                 );
//             }

//             // Nayi image set karo
//             crop_theme_image = newImage;
//             crop_theme_image_id = newImageId;
//         }

//         // Update query
//         const updateCrops = await pool.query(
//             `UPDATE crops
//              SET name=$1,
//                  decription=$2,
//                  crop_theme_image=$3,
//                  crop_theme_image_id=$4
//              WHERE id=$5
//              RETURNING *`,
//             [
//                 name,
//                 description,
//                 crop_theme_image,
//                 crop_theme_image_id,
//                 id
//             ]
//         );

//         res.status(200).json({
//             message: "Crop Updated Successfully",
//             success: true,
//             data: updateCrops.rows[0]
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: `Server Error ${error.message}`,
//             success: false
//         });
//     }
// };

// export const toggleCropsStatus = async (req, res) => {

//     try {
//         const { role } = req?.user

//         console.log(role);

//         if (role !== "Admin") {
//             return res.status(400).json({
//                 message: "You are not Allowed to Perform this Task",
//                 success: false
//             })
//         }
//         const { id } = req?.params;

//         const getCropsByIdForToggleCropStatus = await pool.query("SELECT * FROM crops WHERE id=$1", [id])

//         if (getCropsByIdForToggleCropStatus.rows.length === 0) {
//             return res.status(400).json({
//                 message: `No Crops Found With This ID ${id}`,
//                 success: false,
//             });
//         }

//         const UpdateCropsStatus = await pool.query("UPDATE crops SET is_delete=$1 WHERE id=$2 RETURNING *", [!getCropsByIdForToggleCropStatus?.rows[0]?.is_delete, id])

//         res.status(200).json({
//             message: "Crops Update successfully ",
//             success: true,
//             data: UpdateCropsStatus.rows[0]
//         })

//     } catch (error) {
//         return res.status(500).json({
//             message: `Server Error ${error.message}`,
//             success: false,
//         });
//     }
// }

import pool from "../confiq/mysqldb.js";
import { v2 as cloudinary } from "cloudinary";

export const createCrops = async (req, res) => {
  try {
    const { role } = req?.user;

    console.log(role);

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    console.log("ASDFGHJKL", req?.body, "QWERTYUIOP");

    const { name, description, nameHi, descriptionHi, category_id } = req?.body;

    const crop_theme_image = req.file?.path || null;
    const crop_theme_image_id = req.file?.filename || null;

    if (
      !name ||
      !description ||
      !nameHi ||
      !descriptionHi ||
      !crop_theme_image ||
      !crop_theme_image_id ||
      !category_id
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // MYSQL INSERT
    const [insertCrops] = await pool.query(
      `
            INSERT INTO crops
            (
                name,
                nameHi,
                description,
                descriptionHi,
                crop_theme_image,
                crop_theme_image_id,
                category_id
            )
            VALUES(?,?,?,?,?,?,?)
            `,
      [
        name,
        nameHi,
        description,
        descriptionHi,
        crop_theme_image,
        crop_theme_image_id,
        category_id,
      ],
    );

    // FETCH INSERTED DATA
    const [newCrop] = await pool.query(`SELECT * FROM crops WHERE id=?`, [
      insertCrops.insertId,
    ]);

    res.status(201).json({
      message: `Crops Created successfull`,
      success: true,
      data: newCrop[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const getAllCrops = async (req, res) => {
  try {
    const { limit = 10, page = 1, status = false } = req.query;

    const limitNumber = parseInt(limit);
    const pageNumber = parseInt(page);
    const statusBoolean = status === true || status === "true";

    const offset = (pageNumber - 1) * limitNumber;

    // MYSQL QUERY
    const [getAllCrops] = await pool.query(
      `
            SELECT *
            FROM crops
            WHERE is_delete=?
            ORDER BY id
            LIMIT ?
            OFFSET ?
            `,
      [statusBoolean, limitNumber, offset],
    );

    // TOTAL COUNT
    const [countResult] = await pool.query(
      `
            SELECT COUNT(*) AS total_count
            FROM crops
            WHERE is_delete=?
            `,
      [statusBoolean],
    );

    const totalCount = countResult[0].total_count;

    res.status(200).json({
      success: true,
      message: "Crop Data fetch successfull",
      page,
      limit,
      totalRecords: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      data: getAllCrops,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const updateCrops = async (req, res) => {
  try {
    const { role } = req?.user;

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { id } = req.params;
    const { name, description, nameHi, descriptionHi, category_id } = req.body;

    // Image optional rakh,o
    const newImage = req.file?.path;
    const newImageId = req.file?.filename;

    // Name aur description hi required
    if (!name || !description || !nameHi || !descriptionHi || !category_id) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // MYSQL SELECT
    const [getCropById] = await pool.query("SELECT * FROM crops WHERE id=?", [
      id,
    ]);

    if (getCropById.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const oldCrop = getCropById[0];

    let crop_theme_image = oldCrop.crop_theme_image;
    let crop_theme_image_id = oldCrop.crop_theme_image_id;

    // Agar user ne nayi image bheji hai
    if (newImage && newImageId) {
      // Purani image delete karo
      if (oldCrop.crop_theme_image_id) {
        await cloudinary.uploader.destroy(oldCrop.crop_theme_image_id);
      }

      // Nayi image set karo
      crop_theme_image = newImage;
      crop_theme_image_id = newImageId;
    }

    // MYSQL UPDATE
    await pool.query(
      `
            UPDATE crops 
            SET 
                name=?,
                description=?,
                nameHi=?,
                descriptionHi=?,
                crop_theme_image=?,
                crop_theme_image_id=?,
                category_id=?
            WHERE id=?
            `,
      [
        name,
        description,
        nameHi,
        descriptionHi,
        crop_theme_image,
        crop_theme_image_id,
        category_id,
        id,
      ],
    );

    // FETCH UPDATED DATA
    const [updatedCrop] = await pool.query(`SELECT * FROM crops WHERE id=?`, [
      id,
    ]);

    res.status(200).json({
      message: "Crop Updated Successfully",
      success: true,
      data: updatedCrop[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};

export const toggleCropsStatus = async (req, res) => {
  try {
    const { role } = req?.user;

    console.log(role);

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { id } = req?.params;

    // MYSQL SELECT
    const [getCropsByIdForToggleCropStatus] = await pool.query(
      "SELECT * FROM crops WHERE id=?",
      [id],
    );

    if (getCropsByIdForToggleCropStatus.length === 0) {
      return res.status(400).json({
        message: `No Crops Found With This ID ${id}`,
        success: false,
      });
    }

    // MYSQL UPDATE
    await pool.query("UPDATE crops SET is_delete=? WHERE id=?", [
      !getCropsByIdForToggleCropStatus[0]?.is_delete,
      id,
    ]);

    // FETCH UPDATED DATA
    const [updatedCrop] = await pool.query("SELECT * FROM crops WHERE id=?", [
      id,
    ]);

    res.status(200).json({
      message: "Crops Update successfully ",
      success: true,
      data: updatedCrop[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Error ${error.message}`,
      success: false,
    });
  }
};
