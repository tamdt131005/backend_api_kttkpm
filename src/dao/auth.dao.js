import pool from "../config/db.js";

class AuthDAO {
    async createUser(username, password, fullname, email) {
        const [rows] = await pool.execute(
            'INSERT INTO users (username, password, fullname, email, role) VALUES (?, ?, ?, ?, ?)',
            [username, password, fullname, email, 'user']
        );
        return rows;
    }

    async getUserByUsername(username) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    async getUserByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows.length > 0 ? rows[0] : null;
    }
}

export default new AuthDAO();
