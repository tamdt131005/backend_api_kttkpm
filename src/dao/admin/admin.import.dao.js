import pool from "../../config/db.js";

class AdminImportDAO {
    async layBienTheById(connection, bientheId) {
        const [rows] = await connection.execute(
            "SELECT id, sanpham_id, soluong FROM bienthesp WHERE id = ? LIMIT 1",
            [bientheId]
        );
        return rows[0] || null;
    }

    async taoPhieuNhap(connection, { nguoitao_id, nha_cung_cap, tongtien, ghichu }) {
        const [result] = await connection.execute(
            "INSERT INTO phieunhap (nguoitao_id, nha_cung_cap, tongtien, ghichu) VALUES (?, ?, ?, ?)",
            [nguoitao_id || null, nha_cung_cap || null, tongtien, ghichu || null]
        );
        return result.insertId;
    }

    async taoChiTietPhieuNhap(connection, { phieunhap_id, bienthe_id, soluong, dongia, thanhtien, ghichu }) {
        await connection.execute(
            `
                INSERT INTO chitietphieunhap (phieunhap_id, bienthe_id, soluong, dongia, thanhtien, ghichu)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            [phieunhap_id, bienthe_id, soluong, dongia, thanhtien, ghichu || null]
        );
    }

    async congTonKhoBienThe(connection, bientheId, soluong, dongia) {
        await connection.execute(
            "UPDATE bienthesp SET soluong = soluong + ?, gia_nhap = ? WHERE id = ?",
            [soluong, dongia, bientheId]
        );
    }

    async layDanhSachPhieuNhap(keyword = "") {
        const key = `%${String(keyword || "").trim()}%`;
        const [rows] = await pool.execute(
            `
                SELECT
                    pn.id AS phieunhap_id,
                    pn.createdAt AS ngaynhap,
                    pn.ghichu AS ghichu_phieu,
                    pn.nha_cung_cap,
                    sp.tensanpham,
                    sp.hinhanh,
                    bt.kichthuoc,
                    bt.mausac,
                    ctpn.soluong,
                    ctpn.dongia,
                    ctpn.thanhtien,
                    ctpn.ghichu
                FROM phieunhap pn
                JOIN chitietphieunhap ctpn ON pn.id = ctpn.phieunhap_id
                JOIN bienthesp bt ON ctpn.bienthe_id = bt.id
                JOIN sanpham sp ON bt.sanpham_id = sp.id
                WHERE sp.deleted_at IS NULL AND sp.tensanpham LIKE ?
                ORDER BY pn.id DESC, ctpn.id ASC
            `,
            [key]
        );
        return rows;
    }
}

export default new AdminImportDAO();
