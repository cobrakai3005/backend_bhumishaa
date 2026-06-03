// import pool from "../confiq/mysqldb.js";
// import { v2 as cloudinary } from "cloudinary";

// export const createCropDetails = async (req, res) => {
//     try {

//         const { role } = req?.user

//         console.log(role);

//         if (role !== "Admin") {
//             return res.status(400).json({
//                 message: "You are not Allowed to Perform this Task",
//                 success: false
//             })
//         }

//         const { crop_id, title, description, sequence } = req?.body

//         if (
//             sequence &&
//             isNaN(sequence)
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Sequence must be numeric"
//             });
//         }

//         const crop_details_theme_image =
//             req.files?.map(
//                 file => file.path
//             ) || [];

//         const crop_details_theme_image_id =
//             req.files?.map(
//                 file => file.filename
//             ) || [];

//         if (
//             !crop_id ||
//             !description ||
//             !title ||
//             crop_details_theme_image.length === 0
//         ) {
//             return res.status(400).json({
//                 message: "All fields are required",
//                 success: false
//             })
//         }

//         const cropExists =
//             await pool.query(
//                 `
// SELECT id
// FROM crops
// WHERE id=$1
// `,
//                 [crop_id]
//             );

//         if (cropExists.rows.length === 0) {

//             return res.status(404).json({
//                 success: false,
//                 message: "Crop not found"
//             });

//         }

//         const insertCrops =
//             await pool.query(
//                 `
// INSERT INTO crops_details(
// crop_id,
// title,
// description,
// cropdetail_theme_image,
// crop_details_theme_image_id,
// sequence
// )
// VALUES($1,$2,$3,$4,$5,$6)
// RETURNING *
// `,
//                 [
//                     crop_id,
//                     title,
//                     description,
//                     crop_details_theme_image,
//                     crop_details_theme_image_id,
//                     sequence
//                 ]
//             );

//         res.status(201).json({
//             message: `Crops Created successfull`,
//             success: true,
//             data: insertCrops.rows[0]
//         })

//     } catch (error) {
//         return res.status(500).json({
//             message: `Server Erro ${error.message}`,
//             success: false
//         });
//     }
// }

// export const getAllCropDetails = async (req, res) => {
//     try {

//         const {
//             limit = 10,
//             page = 1,
//             status = false
//         } = req.query;

//         const statusBoolean =
//             status === "true";
//         const limitNumber = parseInt(limit)
//         const pageNumber = parseInt(page)

//         if (
//             isNaN(limitNumber)
//             ||
//             isNaN(pageNumber)
//         ) {

//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "Page and limit must be numbers"
//             });

//         }

//         const offset = (pageNumber - 1) * limitNumber;

//         const getAllCrops =
//             await pool.query(
//                 `
// SELECT *,
// COUNT(*) OVER() AS total_count
// FROM crops_details
// WHERE is_delete=$1
// ORDER BY sequence ASC
// LIMIT $2
// OFFSET $3
// `,
//                 [
//                     statusBoolean,
//                     limitNumber,
//                     offset
//                 ]
//             )

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
//             message: `Server Erro ${error.message}`,
//             success: false
//         });
//     }
// }

// export const updateCropsDetails = async (req, res) => {
//     try {

//         const { role } = req.user;

//         if (role !== "Admin") {
//             return res.status(403).json({
//                 success: false,
//                 message: "You are not allowed"
//             });
//         }

//         const { id } = req.params;

//         const {
//             crop_id,
//             title,
//             description,
//             sequence
//         } = req.body;

//         if (!crop_id || !title || !description) {
//             return res.status(400).json({
//                 message: "All fields are Required",
//                 success: false
//             })
//         }

//         // check crop detail exists
//         const getCropById = await pool.query(
//             `
//             SELECT *
//             FROM crops_details
//             WHERE id=$1
//             `,
//             [id]
//         );

//         if (getCropById.rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Crop detail not found"
//             });
//         }

//         // crop exists check
//         const cropExists = await pool.query(
//             `
//             SELECT id
//             FROM crops
//             WHERE id=$1
//             `,
//             [crop_id]
//         );

//         if (cropExists.rows.length === 0) {

//             return res.status(404).json({
//                 success: false,
//                 message: "Crop not found"
//             });

//         }

//         const existingData =
//             getCropById.rows[0];

//         let finalImages =
//             existingData.cropdetail_theme_image;

//         let finalImageIds =
//             existingData.crop_details_theme_image_id;

//         // if user uploaded new images
//         if (req.files && req.files.length > 0) {

//             const newImages =
//                 req.files.map(
//                     file => file.path
//                 );

//             const newImageIds =
//                 req.files.map(
//                     file => file.filename
//                 );
//             if (
//                 existingData
//                     .crop_details_theme_image_id
//                     ?.length
//             ) {

//                 // delete old cloudinary images
//                 await Promise.all(

//                     existingData
//                         .crop_details_theme_image_id
//                         .map(

//                             imageId =>
//                                 cloudinary
//                                     .uploader
//                                     .destroy(
//                                         imageId
//                                     )

//                         )

//                 );
//             }
//             finalImages = newImages;
//             finalImageIds = newImageIds;

//         }

//         const updateCrop =
//             await pool.query(

//                 `
//         UPDATE crops_details
//         SET
//         crop_id=$1,
//         title=$2,
//         description=$3,
//         cropdetail_theme_image=$4,
//         crop_details_theme_image_id=$5,
//         sequence=$6
//         WHERE id=$7
//         RETURNING *
//         `,

//                 [
//                     crop_id,
//                     title,
//                     description,
//                     finalImages,
//                     finalImageIds,
//                     sequence,
//                     id
//                 ]

//             );

//         return res.status(200).json({
//             success: true,
//             message: "Crop updated successfully",
//             data: updateCrop.rows[0]
//         });

//     } catch (error) {

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };

// export const toggleCropsDetailStatus = async (req, res) => {

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

//         const getCropsByIdForToggleCropStatus = await pool.query("SELECT * FROM crops_details WHERE id=$1", [id])

//         if (getCropsByIdForToggleCropStatus.rows.length === 0) {
//             return res.status(400).json({
//                 message: `No Crops Found With This ID ${id}`,
//                 success: false,
//             });
//         }

//         const UpdateCropsStatus = await pool.query("UPDATE crops_details SET is_delete=$1 WHERE id=$2 RETURNING *", [!getCropsByIdForToggleCropStatus?.rows[0]?.is_delete, id])

//         res.status(200).json({
//             message: "Crops details Update successfully ",
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

// export const updateCropDetailsImages = async (req, res) => {
//     try {

//         const { role } = req.user;

//         if (role !== "Admin") {
//             return res.status(403).json({
//                 success: false,
//                 message: "You are not allowed"
//             });
//         }

//         const { id } = req.params;

//         let { deleteIndexes = [] } = req.body;

//         // string → array convert
//         if (typeof deleteIndexes === "string") {
//             deleteIndexes = [deleteIndexes];
//         }

//         deleteIndexes = deleteIndexes.map(Number);

//         // get crop detail
//         const cropDetail = await pool.query(
//             `
//             SELECT *
//             FROM crops_details
//             WHERE id=$1
//             `,
//             [id]
//         );

//         if (cropDetail.rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Crop detail not found"
//             });
//         }

//         const existingData = cropDetail.rows[0];

//         let images = Array.isArray(
//             existingData.cropdetail_theme_image
//         )
//             ? [...existingData.cropdetail_theme_image]
//             : [];

//         let imageIds = Array.isArray(
//             existingData.crop_details_theme_image_id
//         )
//             ? [...existingData.crop_details_theme_image_id]
//             : [];

//         // DELETE ONLY SELECTED IMAGES
//         if (deleteIndexes.length > 0) {

//             // reverse sort because splice index shift issue
//             deleteIndexes.sort((a, b) => b - a);

//             for (const index of deleteIndexes) {

//                 if (
//                     index >= 0 &&
//                     index < imageIds.length
//                 ) {

//                     // delete from cloudinary
//                     await cloudinary.uploader.destroy(
//                         imageIds[index]
//                     );

//                     // remove from array
//                     images.splice(index, 1);
//                     imageIds.splice(index, 1);
//                 }
//             }
//         }

//         // ADD NEW IMAGES ONLY
//         if (req.files && req.files.length > 0) {

//             const newImages =
//                 req.files.map(
//                     file => file.path
//                 );

//             const newImageIds =
//                 req.files.map(
//                     file => file.filename
//                 );

//             // max image limit
//             if (
//                 images.length +
//                 newImages.length > 10
//             ) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Maximum 10 images allowed"
//                 });
//             }

//             // append only
//             images.push(...newImages);
//             imageIds.push(...newImageIds);
//         }

//         const updatedData = await pool.query(
//             `
//             UPDATE crops_details
//             SET
//             cropdetail_theme_image=$1,
//             crop_details_theme_image_id=$2
//             WHERE id=$3
//             RETURNING *
//             `,
//             [
//                 images,
//                 imageIds,
//                 id
//             ]
//         );

//         return res.status(200).json({
//             success: true,
//             message: "Images updated successfully",
//             data: updatedData.rows[0]
//         });

//     } catch (error) {

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };

import pool from "../confiq/mysqldb.js";
import { v2 as cloudinary } from "cloudinary";

export const createCropDetails = async (req, res) => {
  console.log("Create Crop   Details called");
  try {
    const { role } = req?.user;

    console.log(role);

    if (role !== "Admin") {
      return res.status(400).json({
        message: "You are not Allowed to Perform this Task",
        success: false,
      });
    }

    const { crop_id, title, titleHi, description, descriptionHi, sequence } =
      req?.body;

    if (sequence && isNaN(sequence)) {
      return res.status(400).json({
        success: false,
        message: "Sequence must be numeric",
      });
    }

    const crop_details_theme_image = req.files?.map((file) => file.path) || [];

    const crop_details_theme_image_id =
      req.files?.map((file) => file.filename) || [];

    if (
      !crop_id ||
      !description ||
      !title ||
      crop_details_theme_image.length === 0
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // MYSQL SELECT
    const [cropExists] = await pool.query(
      `
                SELECT id
                FROM crops
                WHERE id=?
                `,
      [crop_id],
    );

    if (cropExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    // MYSQL INSERT
    const [insertCrops] = await pool.query(
      `
                INSERT INTO crops_details(
                    crop_id,
                    title,
                    titleHi,
                    description,
                    descriptionHi,
                    cropdetail_theme_image,
                    crop_details_theme_image_id,
                    sequence
                )
                VALUES(?,?,?,?,?,?,?,?)
                `,
      [
        crop_id,
        title,
        titleHi,
        description,
        descriptionHi,
        JSON.stringify(crop_details_theme_image),
        JSON.stringify(crop_details_theme_image_id),
        sequence,
      ],
    );

    // FETCH INSERTED DATA
    const [newCropDetails] = await pool.query(
      `
                SELECT *
                FROM crops_details
                WHERE id=?
                `,
      [insertCrops.insertId],
    );

    res.status(201).json({
      message: `Crops Created successfull`,
      success: true,
      data: newCropDetails[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server Erro ${error.message}`,
      success: false,
    });
  }
};

export const getAllCropDetails = async (req, res) => {
  try {
    const { limit = 10, page = 1, status = false } = req.query;

    const statusBoolean = status === "true";

    const limitNumber = parseInt(limit);

    const pageNumber = parseInt(page);

    if (isNaN(limitNumber) || isNaN(pageNumber)) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be numbers",
      });
    }

    const offset = (pageNumber - 1) * limitNumber;

    // MYSQL SELECT
    const [getAllCrops] = await pool.query(
      `
                SELECT *
                FROM crops_details
                WHERE is_delete=?
                ORDER BY sequence ASC
                LIMIT ?
                OFFSET ?
                `,
      [statusBoolean, limitNumber, offset],
    );

    // MYSQL COUNT
    const [countResult] = await pool.query(
      `
                SELECT COUNT(*) AS total_count
                FROM crops_details
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
      message: `Server Erro ${error.message}`,
      success: false,
    });
  }
};

export const updateCropsDetails = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed",
      });
    }

    const { id } = req.params;

    const { crop_id, title, titleHi, description, descriptionHi, sequence } =
      req.body;

    if (!crop_id || !title || !description || !titleHi || !descriptionHi) {
      return res.status(400).json({
        message: "All fields are Required",
        success: false,
      });
    }

    // MYSQL SELECT
    const [getCropById] = await pool.query(
      `
            SELECT *
            FROM crops_details
            WHERE id=?
            `,
      [id],
    );

    if (getCropById.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Crop detail not found",
      });
    }

    // MYSQL SELECT
    const [cropExists] = await pool.query(
      `
            SELECT id
            FROM crops
            WHERE id=?
            `,
      [crop_id],
    );

    if (cropExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const existingData = getCropById[0];

    let finalImages = Array.isArray(existingData.cropdetail_theme_image)
      ? existingData.cropdetail_theme_image
      : JSON.parse(existingData.cropdetail_theme_image || "[]");

    let finalImageIds = Array.isArray(existingData.crop_details_theme_image_id)
      ? existingData.crop_details_theme_image_id
      : JSON.parse(existingData.crop_details_theme_image_id || "[]");

    // if user uploaded new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);

      const newImageIds = req.files.map((file) => file.filename);

      if (finalImageIds?.length) {
        // delete old cloudinary images
        await Promise.all(
          finalImageIds.map((imageId) => cloudinary.uploader.destroy(imageId)),
        );
      }

      finalImages = newImages;
      finalImageIds = newImageIds;
    }

    // MYSQL UPDATE
    await pool.query(
      `
            UPDATE crops_details
            SET
                crop_id=?,
                title=?,
                titleHi=?,
                description=?,
                descriptionHi=?,  
                cropdetail_theme_image=?,
                crop_details_theme_image_id=?,
                sequence=?
            WHERE id=?
            `,

      [
        crop_id,
        title,
        titleHi,
        description,
        descriptionHi,
        JSON.stringify(finalImages),
        JSON.stringify(finalImageIds),
        sequence,
        id,
      ],
    );

    // FETCH UPDATED DATA
    const [updatedCrop] = await pool.query(
      `
                SELECT *
                FROM crops_details
                WHERE id=?
                `,
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Crop updated successfully",
      data: updatedCrop[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleCropsDetailStatus = async (req, res) => {
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
      "SELECT * FROM crops_details WHERE id=?",
      [id],
    );

    if (getCropsByIdForToggleCropStatus.length === 0) {
      return res.status(400).json({
        message: `No Crops Found With This ID ${id}`,
        success: false,
      });
    }

    // MYSQL UPDATE
    await pool.query(
      `
            UPDATE crops_details
            SET is_delete=?
            WHERE id=?
            `,
      [!getCropsByIdForToggleCropStatus[0]?.is_delete, id],
    );

    // FETCH UPDATED DATA
    const [updatedCrop] = await pool.query(
      `
                SELECT *
                FROM crops_details
                WHERE id=?
                `,
      [id],
    );

    res.status(200).json({
      message: "Crops details Update successfully ",
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

export const updateCropDetailsImages = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed",
      });
    }

    const { id } = req.params;

    let { deleteIndexes = [] } = req.body;

    // string → array convert
    if (typeof deleteIndexes === "string") {
      deleteIndexes = [deleteIndexes];
    }

    deleteIndexes = deleteIndexes.map(Number);

    // MYSQL SELECT
    const [cropDetail] = await pool.query(
      `
            SELECT *
            FROM crops_details
            WHERE id=?
            `,
      [id],
    );

    if (cropDetail.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Crop detail not found",
      });
    }

    const existingData = cropDetail[0];

    let images = Array.isArray(existingData.cropdetail_theme_image)
      ? [...existingData.cropdetail_theme_image]
      : JSON.parse(existingData.cropdetail_theme_image || "[]");

    let imageIds = Array.isArray(existingData.crop_details_theme_image_id)
      ? [...existingData.crop_details_theme_image_id]
      : JSON.parse(existingData.crop_details_theme_image_id || "[]");

    // DELETE ONLY SELECTED IMAGES
    if (deleteIndexes.length > 0) {
      // reverse sort because splice index shift issue
      deleteIndexes.sort((a, b) => b - a);

      for (const index of deleteIndexes) {
        if (index >= 0 && index < imageIds.length) {
          // delete from cloudinary
          await cloudinary.uploader.destroy(imageIds[index]);

          // remove from array
          images.splice(index, 1);
          imageIds.splice(index, 1);
        }
      }
    }

    // ADD NEW IMAGES ONLY
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);

      const newImageIds = req.files.map((file) => file.filename);

      // max image limit
      if (images.length + newImages.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 images allowed",
        });
      }

      // append only
      images.push(...newImages);
      imageIds.push(...newImageIds);
    }

    // MYSQL UPDATE
    await pool.query(
      `
            UPDATE crops_details
            SET
                cropdetail_theme_image=?,
                crop_details_theme_image_id=?
            WHERE id=?
            `,
      [JSON.stringify(images), JSON.stringify(imageIds), id],
    );

    // FETCH UPDATED DATA
    const [updatedData] = await pool.query(
      `
                SELECT *
                FROM crops_details
                WHERE id=?
                `,
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Images updated successfully",
      data: updatedData[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
