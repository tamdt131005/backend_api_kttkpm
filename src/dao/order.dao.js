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
            SELECT id,
                   id AS donhang_id,
                   ma_donhang,
                   trangthai,
                   phuongthuc_thanhtoan,
                   phuongthuc_thanhtoan AS phuongthucthanhtoan,
                   trangthai_thanhtoan,
                   tongtienhang,
                   phivanchuyen,
                   tongthanhtoan,
                   createdAt
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
        order.donhang_id = order.id;
        order.phuongthucthanhtoan = order.phuongthuc_thanhtoan;

        const [details] = await pool.execute(`
            SELECT ct.*, ct.dongia AS giaban, sp.hinhanh AS hinhanh_ht
            FROM chitietdonhang ct
            LEFT JOIN sanpham sp ON sp.id = ct.sanpham_id
            WHERE ct.donhang_id = ?
        `, [orderId]);

        order.chitiet = details;
        return order;
    }

    async getOrderRowForUser(connection, orderId, userId) {
        const [rows] = await connection.execute(
            `SELECT id, user_id, trangthai FROM donhang WHERE id = ? AND user_id = ? LIMIT 1`,
            [orderId, userId]
        );
        return rows[0] || null;
    }

    async getOrderItems(connection, orderId) {
        const [rows] = await connection.execute(
            `SELECT bienthe_id, soluong FROM chitietdonhang WHERE donhang_id = ?`,
            [orderId]
        );
        return rows;
    }

    async restoreVariantStock(connection, bientheId, quantity) {
        if (!bientheId) return;
        await connection.execute(
            `UPDATE bienthesp SET soluong = soluong + ? WHERE id = ?`,
            [quantity, bientheId]
        );
    }

    async cancelOrder(connection, orderId, lydoHuy) {
        const [result] = await connection.execute(
            `UPDATE donhang SET trangthai = 'dahuy', lydo_huy = ? WHERE id = ?`,
            [lydoHuy || null, orderId]
        );
        return result.affectedRows;
    }
}

export default new OrderDAO();
