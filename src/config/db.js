import config from "./config.json";
import mysql from "mysql2/promise";

const env = process.env.DATABASE || "development";
const dbConfig = config[env];

const pool = mysql.createPool(dbConfig);

export default pool;