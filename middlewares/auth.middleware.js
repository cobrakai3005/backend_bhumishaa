import jwt from "jsonwebtoken";
import pool from "../confiq/mysqldb.js";

// const authMiddleware = async (req, res, next) => {
//   try {
//     let token = null;

//     // 1. Check Authorization header
//     const authHeader = req.headers.authorization;

//     if (authHeader && authHeader.startsWith("Bearer ")) {
//       token = authHeader.split(" ")[1];
//     }

//     // 2. If token not in header then check cookies
//     if (!token && req.cookies?.token) {
//       token = req.cookies.token;
//     }

//     // 3. Token missing
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized : Token not found",
//       });
//     }

//     // 4. Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     console.log("Decoded Token:", decoded);

//     // 5. Search user in database
//     const getUser = await pool.query(
//       `
//             SELECT
//             id,
//             username,
//             phone,
//             profile_image,
//             role,
//             otp_verify
//             FROM users
//             WHERE id=$1
//             `,
//       [decoded.id],
//     );

//     // 6. User not found
//     if (getUser.rows.length <= 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const user = getUser.rows[0];

//     // Optional check
//     if (!user.otp_verify) {
//       return res.status(403).json({
//         success: false,
//         message: "Please verify account first",
//       });
//     }

//     // Store user data in request
//     req.user = user;

//     next();
//   } catch (error) {
//     console.log(error);

//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// };

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. If token not in header then check cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3. Token missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized : Token not found",
      });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token:", decoded);

    // 5. Search user in database
    const [rows] = await pool.query(
      `
            SELECT
            id,
            username,
            phone,
            profile_image,
            role,
            otp_verify
            FROM users
            WHERE id= ?
            `,
      [decoded.id],
    );

    // 6. User not found
    if (rows.length <= 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    // Optional check
    if (!user.otp_verify) {
      return res.status(403).json({
        success: false,
        message: "Please verify account first",
      });
    }

    // Store user data in request
    req.user = user;

    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
