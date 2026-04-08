import pool from "../config/db.js";

class CartDAO {
    async getCartByUserId(userId) {
        const [rows] = await pool.execute(`
            SELECT 
                gh.id AS giohang_id,
                gh.sanpham_id,
                gh.bienthe_id,
                gh.soluong,
                sp.tensanpham,
                sp.giaban,
                sp.giakhuyenmai,
                sp.hinhanh,
                bt.kichthuoc,
                bt.mausac,
                bt.soluong AS soluong_kho,
                bt.hinhanh AS hinhanh_bienthe
            FROM giohang gh
            JOIN sanpham sp ON gh.sanpham_id = sp.id
            LEFT JOIN bienthesp bt ON gh.bienthe_id = bt.id
            WHERE gh.user_id = ?
            ORDER BY gh.id DESC
        `, [userId]);
        return rows;
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa 
    async findCartItem(userId, sanphamId) {
        const [rows] = await pool.execute(`
            SELECT * FROM giohang 
            WHERE user_id = ? AND sanpham_id = ? 
        `, [userId, sanphamId]);
        return rows[0] || null;
    }

    // Thêm sản phẩm vào giỏ
    async addToCart(userId, sanphamId, bientheId, soluong) {
        const [result] = await pool.execute(`
            INSERT INTO giohang (user_id, sanpham_id, bienthe_id, soluong)
            VALUES (?, ?, ?, ?)
        `, [userId, sanphamId, bientheId || null, soluong]);
        return result.insertId;
    }

    // Cập nhật số lượng (cộng dồn)
    async updateQuantity(cartId, userId, soluong) {
        const [result] = await pool.execute(`
            UPDATE giohang SET soluong = ? 
            WHERE id = ? AND user_id = ?
        `, [soluong, cartId, userId]);
        return result.affectedRows;
    }

    // Xóa 1 item khỏi giỏ
    async removeCartItem(cartId, userId) {
        const [result] = await pool.execute(`
            DELETE FROM giohang WHERE id = ? AND user_id = ?
        `, [cartId, userId]);
        return result.affectedRows;
    }

    // Xóa toàn bộ giỏ hàng
    async clearCart(userId) {
        const [result] = await pool.execute(`
            DELETE FROM giohang WHERE user_id = ?
        `, [userId]);
        return result.affectedRows;
    }

    // Tính tổng tiền giỏ hàng
    async getCartTotal(userId) {
        const [rows] = await pool.execute(`
            SELECT SUM(
                CASE 
                    WHEN sp.giakhuyenmai IS NOT NULL AND sp.giakhuyenmai > 0 AND sp.giakhuyenmai < sp.giaban 
                    THEN sp.giakhuyenmai * gh.soluong
                    ELSE sp.giaban * gh.soluong
                END
            ) AS tongtien
            FROM giohang gh
            JOIN sanpham sp ON gh.sanpham_id = sp.id
            WHERE gh.user_id = ?
        `, [userId]);
        return rows[0]?.tongtien || 0;
    }
}

export default new CartDAO();
