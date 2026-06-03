// import pool from "../confiq/db.js"
// import bcrypt from "bcrypt"
// import jwt from "jsonwebtoken"
// const randomOTP = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };

// export const register = async (req, res) => {

//     try {

//         const { username, phone, password } = req?.body
//         const profile_image = req.file?.path || null;
//         const profile_image_id = req.file?.filename || null;

//         console.log(username);
//         console.log(phone);
//         console.log(profile_image);
//         console.log(profile_image_id);

//         const otp = randomOTP();

//         const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

//         if (!username || !phone || !password) {
//             return res.status(400).json({
//                 message: `Username , phone Number And Password Must be required`,
//                 success: false,
//             })
//         };

//         if (password.length < 6) {
//             return res.status(400).json({
//                 message: `Password length should be greter then 6 or equal to 6`,
//                 success: false,
//             })
//         }

//         if (phone.length < 10 || phone.length > 10) {
//             return res.status(400).json({
//                 message: `Phone Number Must be 10 digit`,
//                 success: false,
//             })
//         }

//         const getUserbyPhoneAndUsername = `SELECT * FROM users WHERE phone=$1 OR username=$2`;

//         const userRow = await pool.query(getUserbyPhoneAndUsername, [phone, username]);

//         if (userRow.rows.length > 0) {
//             return res.status(400).json({
//                 message: "User Already exists",
//                 success: false
//             })
//         };

//         const hashPassword = await bcrypt.hash(password, 10);

//         // Insert new Query
//         const insertQuery = `
//         INSERT INTO users(username,profile_image,phone,otp,otp_expire,profile_image_id,password)
//         VALUES($1,$2,$3,$4,$5,$6,$7)
//         RETURNING *
//         `;
//         const newUser = await pool.query(
//             insertQuery,
//             [username, profile_image, phone, otp, otpExpire, profile_image_id, hashPassword]
//         );

//         res.status(201).json({
//             message: `Enter OTP that we sent at this number ${phone}`,
//             success: true,
//             data: newUser.rows[0]
//         })

//     } catch (error) {
//         console.log("FULL ERROR:");
//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: error.message,
//             error: error
//         });
//     }
// }

// export const verifyOTP = async (req, res) => {
//     try {
//         console.log(req?.body);

//         const { phone, otp } = req?.body

//         if (!phone || !otp) {
//             return res.status(400).json({
//                 message: "All Fields are required",
//                 success: false
//             })
//         }

//         if (phone.length < 10 || phone.length > 10) {
//             return res.status(400).json({
//                 message: `Phone Number Must be 10 digit`,
//                 success: false,
//             })
//         }

//         const getUser = await pool.query(`SELECT * FROM users WHERE phone=$1`, [phone])

//         if (getUser.rows.length <= 0) {
//             return res.status(400).json({
//                 message: "User not existed with this number",
//                 success: false
//             })
//         };

//         const existingUser = getUser.rows[0];

//         console.log(existingUser);
//         console.log(otp);

//         if (existingUser?.otp != otp) {
//             return res.status(400).json({
//                 message: "OTP Is wrong",
//                 success: false
//             })
//         }

//         console.log(existingUser);
//         console.log(Date(Date.now()));

//         if (existingUser?.otp_expire < new Date(Date.now())) {
//             return res.status(400).json({
//                 message: "OTP time is expired",
//                 success: false
//             })
//         }

//         const updateOTP_verify = await pool.query("UPDATE users SET otp_verify=$1 WHERE phone=$2", [true, phone])

//         res.status(200).json({
//             message: "OTP verify Successfully",
//             success: true,
//             data: updateOTP_verify.rows[0]
//         })

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }

// }

// export const login = async (req, res) => {

//     try {

//         const { username, password } = req?.body;

//         if (!username || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }

//         const getUser = await pool.query(
//             `SELECT * FROM users WHERE username=$1`,
//             [username]
//         );

//         if (getUser.rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         const existingUser = getUser.rows[0];

//         // OTP verify check
//         if (!existingUser.otp_verify) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please verify your phone number first"
//             });
//         }

//         // compare password
//         const isMatch = await bcrypt.compare(
//             password,
//             existingUser.password
//         );

//         if (!isMatch) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid credentials"
//             });
//         }

//         // create token
//         const token = jwt.sign(
//             {
//                 id: existingUser.id,
//                 phone: existingUser.phone,
//                 role: existingUser.role
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: "1d"
//             }
//         );

//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//             maxAge: 24 * 60 * 60 * 1000
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Login successful",
//             token,
//             user: {
//                 id: existingUser.id,
//                 username: existingUser.username,
//                 phone: existingUser.phone,
//                 profile_image: existingUser.profile_image,
//                 role: existingUser.role
//             }
//         });

//     } catch (error) {

//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// export const resendOtp = async (req, res) => {
//     try {
//         const { phone } = req?.body

//         if (!phone) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }

//         if (phone.length < 10 || phone.length > 10) {
//             return res.status(400).json({
//                 message: `Phone Number Must be 10 digit`,
//                 success: false,
//             })
//         }

//         const getUser = await pool.query("SELECT * FROM users WHERE phone =$1", [phone])

//         if (getUser?.rows?.length <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No user found"
//             })
//         }

//         const otp = randomOTP();

//         const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

//         const insertUserResentOtp = await pool.query("UPDATE users SET otp=$1,otp_expire=$2 WHERE phone=$3 RETURNING *", [otp, otpExpire, phone])

//         res.status(201).json({
//             message: `OTP Resend Successfull ON This Number ${phone}`,
//             success: true,
//             data: insertUserResentOtp.rows[0]
//         })

//     } catch (error) {
//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }

// export const forgetPassword = async (req, res) => {
//     try {

//         const { phone, otp, password, confirmPassword } = req?.body

//         if (!phone || !otp || !password || !confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }

//         if (phone.length < 10 || phone.length > 10) {
//             return res.status(400).json({
//                 message: `Phone Number Must be 10 digit`,
//                 success: false,
//             })
//         }

//         if (password !== confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Password Must be match"
//             })
//         }

//         const getUser = await pool.query("SELECT * FROM users WHERE phone =$1", [phone])

//         if (getUser?.rows?.length <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No user found"
//             })
//         }

//         const existingUser = getUser.rows[0];

//         if (existingUser?.otp !== otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Wrong OTP"
//             })
//         }

//         if (existingUser?.otp_verify < Date(Date.now())) {
//             return res.status(400).json({
//                 success: false,
//                 message: "OTP TIME LIMIT EXPIRED"
//             })
//         }

//         const hashPassword = await bcrypt.hash(password, 10)

//         // Insert new Query
//         const insertQuery = `
//         UPDATE users SET password=$1 WHERE phone=$2
//         RETURNING *
//         `;
//         const newUser = await pool.query(
//             insertQuery,
//             [hashPassword, phone]
//         );
//         res.status(201).json({
//             message: `Password Change successfull`,
//             success: true,
//             data: newUser.rows[0]
//         })

//     } catch (error) {
//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }

// export const updateProfileImage = async (req, res) => {
//     try {

//         const userId = req.user.id;

//         // uploaded image
//         const profile_image = req.file?.path;
//         const profile_image_id = req.file?.filename;

//         if (!profile_image || !profile_image_id) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please upload profile image"
//             });
//         }

//         // get user
//         const getUser = await pool.query(
//             `
//             SELECT *
//             FROM users
//             WHERE id=$1
//             `,
//             [userId]
//         );

//         if (getUser.rows.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         const existingUser = getUser.rows[0];

//         // delete old image if exists
//         if (existingUser.profile_image_id) {

//             await cloudinary.uploader.destroy(
//                 existingUser.profile_image_id
//             );
//         }

//         // update new image
//         const updateUser = await pool.query(
//             `
//             UPDATE users
//             SET
//             profile_image=$1,
//             profile_image_id=$2
//             WHERE id=$3
//             RETURNING *
//             `,
//             [
//                 profile_image,
//                 profile_image_id,
//                 userId
//             ]
//         );

//         return res.status(200).json({
//             success: true,
//             message: "Profile image updated successfully",
//             data: updateUser.rows[0]
//         });

//     } catch (error) {

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };

import pool from "../confiq/mysqldb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const randomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const ALLOWED_ROLES = ["Farmer", "Expert", "Admin", "Vendor", "Customer"];

const normalizeRole = (role) => {
  if (!role || role === "User") return "Farmer";
  return role;
};

export const register = async (req, res) => {
  try {
    const { username, phone, password, role: rawRole } = req?.body;
    const role = normalizeRole(rawRole);
    const profile_image = req.file?.path || null;
    const profile_image_id = req.file?.filename || null;

    console.log(username);
    console.log(phone);
    console.log(profile_image);
    console.log(profile_image_id);

    const otp = randomOTP();

    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    if (!username || !phone || !password) {
      return res.status(400).json({
        message: `Username , phone Number And Password Must be required`,
        success: false,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: `Password length should be greter then 6 or equal to 6`,
        success: false,
      });
    }

    if (phone.length < 10 || phone.length > 10) {
      return res.status(400).json({
        message: `Phone Number Must be 10 digit`,
        success: false,
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}`,
        success: false,
      });
    }

    // MYSQL QUERY
    const getUserbyPhoneAndUsername = `
        SELECT * FROM users 
        WHERE phone=? OR username=?
        `;

    const [userRow] = await pool.query(getUserbyPhoneAndUsername, [
      phone,
      username,
    ]);

    if (userRow.length > 0) {
      return res.status(400).json({
        message: "User Already exists",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // MYSQL INSERT QUERY
    const insertQuery = `
        INSERT INTO users
        (
            username,
            profile_image,
            phone,
            otp,
            otp_expire,
            profile_image_id,
            password,
            role
        )
        VALUES(?,?,?,?,?,?,?,?)
        `;

    const [newUser] = await pool.query(insertQuery, [
      username,
      profile_image,
      phone,
      otp,
      otpExpire,
      profile_image_id,
      hashPassword,
      role,
    ]);

    // // Existing frontend has no OTP screen — auto-verify so login works after register
    // await pool.query(`UPDATE users SET otp_verify=? WHERE id=?`, [
    //   true,
    //   newUser.insertId,
    // ]);

    // GET INSERTED USER
    const [insertedUser] = await pool.query(`SELECT * FROM users WHERE id=?`, [
      newUser.insertId,
    ]);

    res.status(201).json({
      message: `Enter OTP that we sent at this number ${phone}`,
      success: true,
      data: insertedUser[0],
    });
  } catch (error) {
    console.log("FULL ERROR:");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    console.log(req?.body);

    const { phone, otp } = req?.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: "All Fields are required",
        success: false,
      });
    }

    if (phone.length < 10 || phone.length > 10) {
      return res.status(400).json({
        message: `Phone Number Must be 10 digit`,
        success: false,
      });
    }

    // MYSQL QUERY
    const [getUser] = await pool.query(`SELECT * FROM users WHERE phone=?`, [
      phone,
    ]);

    if (getUser.length <= 0) {
      return res.status(400).json({
        message: "User not existed with this number",
        success: false,
      });
    }

    const existingUser = getUser[0];

    console.log(existingUser);
    console.log(otp);

    if (existingUser?.otp != otp) {
      return res.status(400).json({
        message: "OTP Is wrong",
        success: false,
      });
    }

    console.log(existingUser);
    console.log(Date(Date.now()));

    if (existingUser?.otp_expire < new Date(Date.now())) {
      return res.status(400).json({
        message: "OTP time is expired",
        success: false,
      });
    }

    // MYSQL UPDATE
    await pool.query("UPDATE users SET otp_verify=? WHERE phone=?", [
      true,
      phone,
    ]);

    // FETCH UPDATED USER
    const [updatedUser] = await pool.query(
      "SELECT * FROM users WHERE phone=?",
      [phone],
    );

    res.status(200).json({
      message: "OTP verify Successfully",
      success: true,
      data: updatedUser[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req?.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // MYSQL QUERY
    const [getUser] = await pool.query(`SELECT * FROM users WHERE username=?`, [
      username,
    ]);

    if (getUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingUser = getUser[0];

    // OTP verify check
    if (!existingUser.otp_verify) {
      return res.status(400).json({
        success: false,
        message: "Please verify your phone number first",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // create token
    const token = jwt.sign(
      {
        id: existingUser.id,
        phone: existingUser.phone,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        phone: existingUser.phone,
        profile_image: existingUser.profile_image,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { phone } = req?.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (phone.length < 10 || phone.length > 10) {
      return res.status(400).json({
        message: `Phone Number Must be 10 digit`,
        success: false,
      });
    }

    // MYSQL QUERY
    const [getUser] = await pool.query("SELECT * FROM users WHERE phone = ?", [
      phone,
    ]);

    if (getUser?.length <= 0) {
      return res.status(400).json({
        success: false,
        message: "No user found",
      });
    }

    const otp = randomOTP();

    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    // MYSQL UPDATE
    await pool.query("UPDATE users SET otp=?, otp_expire=? WHERE phone=?", [
      otp,
      otpExpire,
      phone,
    ]);

    // FETCH UPDATED USER
    const [updatedUser] = await pool.query(
      "SELECT * FROM users WHERE phone=?",
      [phone],
    );

    res.status(201).json({
      message: `OTP Resend Successfull ON This Number ${phone}`,
      success: true,
      data: updatedUser[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { phone, otp, password, confirmPassword } = req?.body;

    if (!phone || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (phone.length < 10 || phone.length > 10) {
      return res.status(400).json({
        message: `Phone Number Must be 10 digit`,
        success: false,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password Must be match",
      });
    }

    // MYSQL QUERY
    const [getUser] = await pool.query("SELECT * FROM users WHERE phone = ?", [
      phone,
    ]);

    if (getUser?.length <= 0) {
      return res.status(400).json({
        success: false,
        message: "No user found",
      });
    }

    const existingUser = getUser[0];

    if (existingUser?.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Wrong OTP",
      });
    }

    if (existingUser?.otp_expire < new Date(Date.now())) {
      return res.status(400).json({
        success: false,
        message: "OTP TIME LIMIT EXPIRED",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // MYSQL UPDATE
    await pool.query(`UPDATE users SET password=? WHERE phone=?`, [
      hashPassword,
      phone,
    ]);

    // FETCH UPDATED USER
    const [updatedUser] = await pool.query(
      `SELECT * FROM users WHERE phone=?`,
      [phone],
    );

    res.status(201).json({
      message: `Password Change successfull`,
      success: true,
      data: updatedUser[0],
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    // uploaded image
    const profile_image = req.file?.path;
    const profile_image_id = req.file?.filename;

    if (!profile_image || !profile_image_id) {
      return res.status(400).json({
        success: false,
        message: "Please upload profile image",
      });
    }

    // MYSQL QUERY
    const [getUser] = await pool.query(
      `
            SELECT *
            FROM users
            WHERE id=?
            `,
      [userId],
    );

    if (getUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingUser = getUser[0];

    // delete old image if exists
    if (existingUser.profile_image_id) {
      await cloudinary.uploader.destroy(existingUser.profile_image_id);
    }

    // MYSQL UPDATE
    await pool.query(
      `
            UPDATE users
            SET
            profile_image=?,
            profile_image_id=?
            WHERE id=?
            `,
      [profile_image, profile_image_id, userId],
    );

    // FETCH UPDATED USER
    const [updatedUser] = await pool.query(`SELECT * FROM users WHERE id=?`, [
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: updatedUser[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
