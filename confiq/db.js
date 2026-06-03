// import { Pool } from "pg";
// import dotenv from "dotenv";
// import sql from "../models/modej.js";

// dotenv.config();

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT),
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// const connectDB = async () => {
//     try {

//         // test connection
//         const result = await pool.query("SELECT NOW()");

//         console.log("PostgreSQL Connected Successfully");
//         console.log(result.rows[0]);

//         // create tables
//         await pool.query(sql);

//         console.log("Tables created successfully");

//     } catch (error) {

//         console.log("Database Error:", error.message);

//     }
// };

// connectDB();

// export default pool;

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import sql from "../models/mysqlModel.js";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,

  multipleStatements: true,
});

const connectDB = async () => {
  try {
    // test connection
    const connection = await pool.getConnection();

    const [rows] = await connection.query("SELECT NOW() AS now");

    console.log("MySQL Connected Successfully");

    console.log(rows[0]);

    // create tables
    await connection.query(sql);

    console.log("Tables created successfully");

    connection.release();
  } catch (error) {
    console.log("Database Error:", error.message);
  }
};

connectDB();

export default pool;
