import pool from "../config/db.js";

class UserProductsDAO {
    async getAllProducts() {
        const [rows] = await pool.query('SELECT * FROM sanpham');
        return rows;
    }
    async getProductById(id) {
        const [rows] = await pool.execute('SELECT * FROM sanpham WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    async getProductsByCategoryId(categoryId) {
        const [rows] = await pool.execute('SELECT * FROM sanpham WHERE danhmuc_id = ?', [categoryId]);
        return rows;
    }
}

export default new UserProductsDAO();