import pool from "../config/db.js";

class AddressDAO {
    // Lấy danh sách địa chỉ của user (chưa bị xóa mềm)
    async getAddressesByUserId(userId) {
        const [rows] = await pool.execute(`
            SELECT * FROM diachigiaohang 
            WHERE user_id = ? AND deleted_at IS NULL
            ORDER BY macdinh DESC, id DESC
        `, [userId]);
        return rows;
    }

    // Lấy 1 địa chỉ cụ thể
    async getAddressById(id, userId) {
        const [rows] = await pool.execute(`
            SELECT * FROM diachigiaohang 
            WHERE id = ? AND user_id = ? AND deleted_at IS NULL
        `, [id, userId]);
        return rows[0] || null;
    }

    // Tạo địa chỉ mới
    async createAddress(userId, data) {
        const { tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh, macdinh } = data;

        if (macdinh) {
            await pool.execute(`
                UPDATE diachigiaohang SET macdinh = 0 
                WHERE user_id = ? AND deleted_at IS NULL
            `, [userId]);
        }

        const [result] = await pool.execute(`
            INSERT INTO diachigiaohang (user_id, tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh, macdinh)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [userId, tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh, macdinh ? 1 : 0]);
        return result.insertId;
    }

    // Đặt địa chỉ mặc định
    async setDefault(id, userId) {
        await pool.execute(`
            UPDATE diachigiaohang SET macdinh = 0 
            WHERE user_id = ? AND deleted_at IS NULL
        `, [userId]);
        const [result] = await pool.execute(`
            UPDATE diachigiaohang SET macdinh = 1 
            WHERE id = ? AND user_id = ?
        `, [id, userId]);
        return result.affectedRows;
    }
}

export default new AddressDAO();
