import pool from "../config/db.js";

class ProfileDao {
    async getProfile(id) {
        const [rows] = await pool.execute('SELECT username, email, fullname, phone, sex, ngaysinh, avatar FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    async putProfile(id, profileData) {
        const {email, fullname, phone, sex, ngaysinh, avatar} = profileData;
        const [row] = await pool.execute('UPDATE users SET email = ?, fullname = ?, phone= ?, sex= ?, ngaysinh= ?, avatar= ? WHERE id = ?',[email,fullname,phone,sex,ngaysinh,avatar,id]);
        return row.affectedRows;
    }
}

export default new ProfileDao();