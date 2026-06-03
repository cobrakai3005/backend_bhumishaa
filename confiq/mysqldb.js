import mysql from "mysql2/promise";
import dotenv from "dotenv";
// import sql from "../models/model.js";
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
  queueLimit: 0,
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

    const { applyFrontendCompat } = await import("./frontendCompat.js");
    await applyFrontendCompat();

    connection.release();
  } catch (error) {
    console.log("Database Error:", error.message);
  }
};

connectDB();

export default pool;
