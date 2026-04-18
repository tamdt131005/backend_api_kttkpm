import pool from "../../config/db.js";

class AdminOrderDAO {
    async layTatCaDonHang(trangthai = "all", keyword = "") {
        let sql = `
            SELECT
                dh.id AS donhang_id,
                dh.ma_donhang,
                dh.user_id,
                dh.ghichu,
                dh.lydo_huy,
                dh.trangthai,
                dh.phuongthuc_thanhtoan AS phuongthucthanhtoan,
                dh.trangthai_thanhtoan AS trangthaithanhtoan,
                dh.tongtienhang,
                dh.giam_gia,
                dh.phivanchuyen,
                dh.tongthanhtoan,
                dh.createdAt AS ngaytao,
                dh.updatedAt AS ngaycapnhat,
                u.fullname AS ten_khachhang,
                u.phone AS sdt_khachhang,
                u.email AS email_khachhang,
                dc.tennguoinhan,
                dc.sodienthoai,
                dc.diachichitiet,
                dc.phuong,
                dc.quan,
                dc.tinh
            FROM donhang dh
            LEFT JOIN users u ON dh.user_id = u.id
            LEFT JOIN diachigiaohang dc ON dh.diachi_id = dc.id
            WHERE 1 = 1
        `;

        const params = [];

        if (trangthai && trangthai !== "all") {
            sql += " AND dh.trangthai = ?";
            params.push(trangthai);
        }

        if (keyword && String(keyword).trim() !== "") {
            const key = `%${String(keyword).trim()}%`;
            sql += `
                AND (
                    dh.ma_donhang LIKE ?
                    OR COALESCE(u.fullname, '') LIKE ?
                    OR COALESCE(u.email, '') LIKE ?
                    OR COALESCE(u.phone, '') LIKE ?
                )
            `;
            params.push(key, key, key, key);
        }

        sql += " ORDER BY dh.createdAt DESC";

        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    async layChiTietDonHang(donhangId) {
        const [rows] = await pool.execute(
            `
                SELECT
                    dh.id AS donhang_id,
                    dh.*,
                    dh.phuongthuc_thanhtoan AS phuongthucthanhtoan,
                    dh.trangthai_thanhtoan AS trangthaithanhtoan,
                    dh.createdAt AS ngaytao,
                    u.fullname AS ten_khachhang,
                    u.phone AS sdt_khachhang,
                    u.email AS email_khachhang,
                    dc.tennguoinhan,
                    dc.sodienthoai,
                    dc.diachichitiet,
                    dc.phuong,
                    dc.quan,
                    dc.tinh
                FROM donhang dh
                LEFT JOIN users u ON dh.user_id = u.id
                LEFT JOIN diachigiaohang dc ON dh.diachi_id = dc.id
                WHERE dh.id = ?
                LIMIT 1
            `,
            [donhangId]
        );

        if (!rows.length) {
            return null;
        }

        const donhang = rows[0];

        const [sanpham] = await pool.execute(
            `
                SELECT
                    ct.id,
                    ct.sanpham_id,
                    ct.bienthe_id,
                    ct.tensanpham,
                    ct.kichthuoc,
                    ct.mausac,
                    ct.ma_sku,
                    ct.dongia,
                    ct.soluong,
                    ct.thanhtien,
                    sp.hinhanh,
                    sp.giaban,
                    sp.giakhuyenmai
                FROM chitietdonhang ct
                LEFT JOIN sanpham sp ON ct.sanpham_id = sp.id
                WHERE ct.donhang_id = ?
                ORDER BY ct.id ASC
            `,
            [donhangId]
        );

        donhang.sanpham = sanpham;
        return donhang;
    }

    async capNhatTrangThaiDonHang(donhangId, trangthaiMoi) {
        const [result] = await pool.execute(
            "UPDATE donhang SET trangthai = ? WHERE id = ?",
            [trangthaiMoi, donhangId]
        );
        return result.affectedRows;
    }

    async capNhatTrangThaiThanhToan(donhangId, trangthaiMoi) {
        const [result] = await pool.execute(
            "UPDATE donhang SET trangthai_thanhtoan = ? WHERE id = ?",
            [trangthaiMoi, donhangId]
        );
        return result.affectedRows;
    }

    async themLichSuDonHang(donhangId, nguoidungId, trangthaiCu, trangthaiMoi, ghichu) {
        await pool.execute(
            `
                INSERT INTO lichsu_donhang (donhang_id, nguoidung_id, trangthai_cu, trangthai_moi, ghichu)
                VALUES (?, ?, ?, ?, ?)
            `,
            [donhangId, nguoidungId || null, trangthaiCu || null, trangthaiMoi, ghichu || null]
        );
    }

    async thongKeDonHang() {
        const [rows] = await pool.execute(
            "SELECT trangthai, COUNT(*) AS soluong FROM donhang GROUP BY trangthai"
        );

        const thongke = {
            tatca: 0,
            choxacnhan: 0,
            dangxuly: 0,
            danggiao: 0,
            dagiao: 0,
            dahuy: 0
        };

        for (const row of rows) {
            const trangthai = row.trangthai === "daxacnhan" ? "dangxuly" : row.trangthai;
            const soluong = Number(row.soluong) || 0;
            if (Object.prototype.hasOwnProperty.call(thongke, trangthai)) {
                thongke[trangthai] += soluong;
            }
            thongke.tatca += soluong;
        }

        return thongke;
    }

    async layTongDoanhThu(tuNgay = null, denNgay = null) {
        let sql = `
            SELECT COALESCE(SUM(tongthanhtoan), 0) AS tongdoanhthu
            FROM donhang
            WHERE trangthai = 'dagiao'
        `;

        const params = [];

        if (tuNgay) {
            sql += " AND DATE(createdAt) >= ?";
            params.push(tuNgay);
        }

        if (denNgay) {
            sql += " AND DATE(createdAt) <= ?";
            params.push(denNgay);
        }

        const [rows] = await pool.execute(sql, params);
        return Number(rows[0]?.tongdoanhthu || 0);
    }
}

export default new AdminOrderDAO();
