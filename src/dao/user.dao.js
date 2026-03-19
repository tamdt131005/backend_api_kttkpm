import pool from '../config/db.js';

class UserDAO {
    // Vi du lay tat ca user (Example: Get all users)
    async getAllUsers() {
        // Su dung prepared statement (dau ?) de chong SQL Injection
        const [rows] = await pool.query('SELECT * FROM user');
        return rows;
    }

    // Vi du lay user theo username (Example: Get user by username)
    async getUserByUsername(username) {
        const [rows] = await pool.execute('SELECT * FROM user WHERE username = ?', [username]);
        return rows.length > 0 ? rows[0] : null;
    }
}

export default new UserDAO();
