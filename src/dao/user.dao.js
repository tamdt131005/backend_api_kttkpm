import pool from '../config/db.js';

class UserDAO {
    async getAllUsers() {

        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
    }
    async getUserByUsername(username) {
        const [rows] = await pool.execute('SELECT * FROM users  WHERE username = ?', [username]);
        return rows.length > 0 ? rows[0] : null;
    }
}

export default new UserDAO();
