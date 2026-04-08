import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'src', 'config', 'config.json');
const rawConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
const cfg = rawConfig.development || rawConfig;

const pool = mysql.createPool({
    host: cfg.host || cfg.hostname,
    user: cfg.username || cfg.user,
    password: cfg.password || cfg.pass,
    database: cfg.database || cfg.db,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then((connection) => {
        console.log("Kết nối cơ sở dữ liệu thành công!");
        connection.release();
    })
    .catch((err) => {
        console.error("Lỗi kết nối cơ sở dữ liệu:", err);
    });

export default pool;