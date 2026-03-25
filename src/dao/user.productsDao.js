import pool from "../config/db.js";

class UserProductsDAO {
    async getAllProducts() {
        const [rows] = await pool.query("SELECT 
                sp.id,
            sp.tensanpham,
            sp.giaban,
            sp.giakhuyenmai,
            sp.hinhanh,
            COALESCE(SUM(bt.soluong), 0) AS tong_soluong,
            COALESCE(AVG(dg.sao), 0) AS diem_danhgia,
            COUNT(dg.id) AS luot_danhgia
                FROM sanpham sp
                LEFT JOIN bienthesp bt ON sp.id = bt.sanpham_id
                LEFT JOIN danhgia dg ON sp.id = dg.sanpham_id
                WHERE sp.an_hien = 1 AND sp.deleted_at IS NULL
                GROUP BY sp.id
                ORDER BY sp.createdAt DESC 
                LIMIT 8");
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