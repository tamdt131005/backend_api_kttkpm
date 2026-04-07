import pool from "../config/db.js";

class OrderDAO {
    async taoDonHang( orderData) {
        const {
            ma_donhang,
            user_id,
            diachi_id,
            snapshot_diachi,
            ghichu,
            phuongthuc_thanhtoan,
            tongtienhang,
            phivanchuyen,
            tongthanhtoan
        } = orderData;

        const [result] = await pool.execute(`
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
    async taoChiTietDonHang(donhangId, items) {
        for (const item of items) {
            await pool.execute(`
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

    async getProductSnapshotForOrderItem(sanphamId, bientheId = null) {
        const [rows] = await pool.execute(
            `
                SELECT
                    sp.id AS sanpham_id,
                    sp.tensanpham,
                    sp.giaban,
                    sp.giakhuyenmai,
                    bt.id AS bienthe_id,
                    bt.kichthuoc,
                    bt.mausac,
                    bt.ma_sku,
                    bt.soluong AS soluong_kho
                FROM sanpham sp
                LEFT JOIN bienthesp bt ON bt.id = ?
                WHERE sp.id = ?
                  AND (? IS NULL OR bt.sanpham_id = sp.id)
                LIMIT 1
            `, [bientheId, sanphamId, bientheId]
        );

        return rows[0] || null;
    }

    // Trừ tồn kho biến thể
    async updateTonkho(bientheId, quantity) {
        if (!bientheId) return;
        await pool.execute(`
            UPDATE bienthesp SET soluong = soluong - ? 
            WHERE id = ? AND soluong >= ?
        `, [quantity, bientheId, quantity]);
    }
    async addLichSuDonHang(donhangId, userId, trangthaiMoi, ghichu) {
        await pool.execute(`
            INSERT INTO lichsu_donhang (donhang_id, nguoidung_id, trangthai_cu, trangthai_moi, ghichu)
            VALUES (?, ?, NULL, ?, ?)
        `, [donhangId, userId, trangthaiMoi, ghichu || 'Đặt hàng mới']);
    }

    // Lấy danh sách đơn hàng của user
    async getDonHangCuaUser(userId) {
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

    async getOrderBymaDonHang(maDonhang) {
        const [rows] = await pool.execute(
            `
                SELECT
                    id,
                    ma_donhang,
                    user_id,
                    tongthanhtoan,
                    trangthai_thanhtoan,
                    phuongthuc_thanhtoan
                FROM donhang
                WHERE ma_donhang = ?
                LIMIT 1
            `, [maDonhang]
        );
        return rows[0] || null;
    }

    async updateTrangThaiThanhToan(maDonhang, trangThaiThanhToan = 'dathanhtoan', phuongThucThanhToan = 'chuyenkhoan') {
        const [result] = await pool.execute(
            `
                UPDATE donhang
                SET trangthai_thanhtoan = ?
                WHERE ma_donhang = ?
            `, [trangThaiThanhToan, maDonhang]
        );

        return result.affectedRows;
    }

    async markOrderPaidByCode(maDonhang) {
        return this.updateTrangThaiThanhToan(maDonhang, 'dathanhtoan', 'chuyenkhoan');
    }

    async getOrderRowForUser(orderId, userId) {
        const [rows] = await pool.execute(
            `SELECT id, user_id, trangthai FROM donhang WHERE id = ? AND user_id = ? LIMIT 1`, [orderId, userId]
        );
        return rows[0] || null;
    }

    async getOrderItems(orderId) {
        const [rows] = await pool.execute(
            `SELECT bienthe_id, soluong FROM chitietdonhang WHERE donhang_id = ?`, [orderId]
        );
        return rows;
    }

    async restoreTonkho(bientheId, quantity) {
        if (!bientheId) return;
        await pool.execute(
            `UPDATE bienthesp SET soluong = soluong + ? WHERE id = ?`, [quantity, bientheId]
        );
    }

    async cancelOrder(orderId, lydoHuy) {
        const [result] = await pool.execute(
            `UPDATE donhang SET trangthai = 'dahuy', lydo_huy = ? WHERE id = ?`, [lydoHuy || null, orderId]
        );
        return result.affectedRows;
    }
}

export default new OrderDAO();