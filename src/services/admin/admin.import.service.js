import pool from "../../config/db.js";
import adminImportDAO from "../../dao/admin/admin.import.dao.js";

class AdminImportService {
    async layNhapHang(keyword = "") {
        const data = await adminImportDAO.layDanhSachPhieuNhap(keyword);
        let tongTien = 0;
        let tongSoLuong = 0;

        for (const row of data) {
            tongTien += Number(row.thanhtien || 0);
            tongSoLuong += Number(row.soluong || 0);
        }

        return {
            data,
            tongTien,
            tongSoLuong
        };
    }

    chuanHoaRowsNhapHang(payload) {
        if (Array.isArray(payload.rows)) {
            return payload.rows;
        }

        const bientheIdArr = Array.isArray(payload.bienthe_id) ? payload.bienthe_id : [];
        const soluongArr = Array.isArray(payload.soluong) ? payload.soluong : [];
        const dongiaArr = Array.isArray(payload.dongia) ? payload.dongia : [];
        const ghichuArr = Array.isArray(payload.ghichu) ? payload.ghichu : [];

        const maxLength = Math.max(
            bientheIdArr.length,
            soluongArr.length,
            dongiaArr.length,
            ghichuArr.length
        );

        const rows = [];
        for (let i = 0; i < maxLength; i += 1) {
            rows.push({
                bienthe_id: bientheIdArr[i],
                soluong: soluongArr[i],
                dongia: dongiaArr[i],
                ghichu: ghichuArr[i]
            });
        }

        return rows;
    }

    async themPhieuNhap(payload) {
        const ghichu_phieu = String(payload.ghichu_phieu || "").trim();
        const nha_cung_cap = String(payload.nha_cung_cap || "").trim();
        const nguoitao_id = payload.nguoitao_id ? Number(payload.nguoitao_id) : null;
        const rawRows = this.chuanHoaRowsNhapHang(payload);

        const rows = rawRows
            .map((row) => ({
                bienthe_id: Number(row.bienthe_id),
                soluong: Number(row.soluong),
                dongia: Number(row.dongia),
                ghichu: String(row.ghichu || "").trim()
            }))
            .filter((row) => row.bienthe_id > 0 && row.soluong > 0 && row.dongia > 0);

        if (!rows.length) {
            throw { status: 400, message: "Phieu nhap phai co it nhat 1 dong hop le" };
        }

        let tongtien = 0;
        for (const row of rows) {
            tongtien += row.soluong * row.dongia;
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const phieunhap_id = await adminImportDAO.taoPhieuNhap(connection, {
                nguoitao_id,
                nha_cung_cap,
                tongtien,
                ghichu: ghichu_phieu
            });

            for (const row of rows) {
                const bienthe = await adminImportDAO.layBienTheById(connection, row.bienthe_id);
                if (!bienthe) {
                    throw { status: 400, message: `Bien the khong ton tai: ${row.bienthe_id}` };
                }

                const thanhtien = row.soluong * row.dongia;

                await adminImportDAO.taoChiTietPhieuNhap(connection, {
                    phieunhap_id,
                    bienthe_id: row.bienthe_id,
                    soluong: row.soluong,
                    dongia: row.dongia,
                    thanhtien,
                    ghichu: row.ghichu
                });

                await adminImportDAO.congTonKhoBienThe(connection, row.bienthe_id, row.soluong, row.dongia);
            }

            await connection.commit();

            return {
                phieunhap_id,
                tongtien
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new AdminImportService();
