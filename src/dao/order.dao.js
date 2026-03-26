import pool from "../config/db.js";

class OrderDAO {
    // Tạo đơn hàng mới
    async createOrder(connection, orderData) {
        const {
            ma_donhang, user_id, diachi_id, snapshot_diachi,
            ghichu, phuongthuc_thanhtoan,
            tongtienhang, phivanchuyen, tongthanhtoan
        } = orderData;

        const [result] = await connection.execute(`
            INSERT INTO donhang 
            (ma_donhang, user_id, diachi_id, snapshot_diachi, ghichu, 
             phuongthuc_thanhtoan, tongtienhang, phivanchuyen, tongthanhtoan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            ma_donhang, user_id, diachi_id, snapshot_diachi,
            ghichu || null, phuongthuc_thanhtoan || 'tienmat',
            tongtienhang, phivanchuyen, tongthanhtoan
        ]);
        return result.insertId;
    }

    // Tạo chi tiết đơn hàng (nhiều dòng)
    async createOrderDetails(connection, donhangId, items) {
        for (const item of items) {
            await connection.execute(`
                INSERT INTO chitietdonhang 
                (donhang_id, sanpham_id, bienthe_id, tensanpham, kichthuoc, mausac, ma_sku, dongia, soluong, thanhtien)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                donhangId,
                item.sanpham_id,
                item.bienthe_id || null,
                item.tensanpham,
                item.kichthuoc || null,
                item.mausac || null,
                item.ma_sku || null,
                item.dongia,
                item.soluong,
                item.thanhtien
            ]);
        }
    }

    // Trừ tồn kho biến thể
    async updateStock(connection, bientheId, quantity) {
        if (!bientheId) return;
        await connection.execute(`
            UPDATE bienthesp SET soluong = soluong - ? 
            WHERE id = ? AND soluong >= ?
        `, [quantity, bientheId, quantity]);
    }

    // Ghi lịch sử trạng thái đơn hàng
    async addOrderHistory(connection, donhangId, userId, trangthaiMoi, ghichu) {
        await connection.execute(`
            INSERT INTO lichsu_donhang (donhang_id, nguoidung_id, trangthai_cu, trangthai_moi, ghichu)
            VALUES (?, ?, NULL, ?, ?)
        `, [donhangId, userId, trangthaiMoi, ghichu || 'Đặt hàng mới']);
    }

    // Lấy danh sách đơn hàng của user
    async getOrdersByUserId(userId) {
        const [rows] = await pool.execute(`
            SELECT id, ma_donhang, trangthai, phuongthuc_thanhtoan, trangthai_thanhtoan,
                   tongtienhang, phivanchuyen, tongthanhtoan, createdAt
            FROM donhang 
            WHERE user_id = ?
            ORDER BY createdAt DESC
        `, [userId]);
        return rows;
    }

    // Lấy chi tiết 1 đơn hàng
    async getOrderById(orderId, userId) {
        const [rows] = await pool.execute(`
            SELECT * FROM donhang WHERE id = ? AND user_id = ?
        `, [orderId, userId]);
        if (rows.length === 0) return null;

        const order = rows[0];

        const [details] = await pool.execute(`
            SELECT * FROM chitietdonhang WHERE donhang_id = ?
        `, [orderId]);

        order.chitiet = details;
        return order;
    }
}

export default new OrderDAO();
