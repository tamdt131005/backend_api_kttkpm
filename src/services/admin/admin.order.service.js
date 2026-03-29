import adminOrderDAO from "../../dao/admin/admin.order.dao.js";
import { layTrangThaiTiepTheo, thuTuTrangThai, trangThaiThanhToanHopLe } from "./admin.shared.js";

class AdminOrderService {
    async layDanhSachDonHang(trangthai = "all", keyword = "") {
        const danhsach = await adminOrderDAO.layTatCaDonHang(trangthai, keyword);
        const thongke = await adminOrderDAO.thongKeDonHang();
        const tongdoanhthu = await adminOrderDAO.layTongDoanhThu();
        return {
            danhsach,
            thongke,
            tongdoanhthu
        };
    }

    async layChiTietDonHang(donhangId) {
        const donhang = await adminOrderDAO.layChiTietDonHang(donhangId);
        if (!donhang) {
            throw { status: 404, message: "Khong tim thay don hang" };
        }

        return {
            ...donhang,
            trangthai_tiep_theo: layTrangThaiTiepTheo(donhang.trangthai)
        };
    }

    async capNhatTrangThaiDonHang(donhangId, trangthaiMoi, nguoidungId = null) {
        if (!Object.prototype.hasOwnProperty.call(thuTuTrangThai, trangthaiMoi)) {
            throw { status: 400, message: "Trang thai khong hop le" };
        }

        const donhang = await adminOrderDAO.layChiTietDonHang(donhangId);
        if (!donhang) {
            throw { status: 404, message: "Khong tim thay don hang" };
        }

        if (donhang.trangthai === "dagiao") {
            throw { status: 400, message: "Don hang da hoan thanh" };
        }

        if (donhang.trangthai === "dahuy") {
            throw { status: 400, message: "Don hang da huy" };
        }

        const indexHienTai = thuTuTrangThai[donhang.trangthai];
        const indexMoi = thuTuTrangThai[trangthaiMoi];

        if (typeof indexHienTai !== "number") {
            throw { status: 400, message: "Trang thai hien tai khong hop le" };
        }

        if (indexMoi === indexHienTai) {
            throw { status: 400, message: "Don hang da o trang thai nay" };
        }

        if (indexMoi < indexHienTai) {
            throw { status: 400, message: "Khong the quay lai trang thai truoc" };
        }

        if (indexMoi > indexHienTai + 1) {
            const trangthaiTiepTheo = layTrangThaiTiepTheo(donhang.trangthai);
            throw {
                status: 400,
                message: `Chi co the chuyen sang trang thai tiep theo: ${trangthaiTiepTheo}`
            };
        }

        const affectedRows = await adminOrderDAO.capNhatTrangThaiDonHang(donhangId, trangthaiMoi);
        if (affectedRows <= 0) {
            throw { status: 400, message: "Khong the cap nhat trang thai" };
        }

        await adminOrderDAO.themLichSuDonHang(
            donhangId,
            nguoidungId,
            donhang.trangthai,
            trangthaiMoi,
            "Cap nhat trang thai boi admin"
        );

        return {
            donhang_id: Number(donhangId),
            trangthai_cu: donhang.trangthai,
            trangthai_moi: trangthaiMoi
        };
    }

    async capNhatTrangThaiThanhToan(donhangId, trangthaiMoi) {
        if (!trangThaiThanhToanHopLe.includes(trangthaiMoi)) {
            throw { status: 400, message: "Trang thai thanh toan khong hop le" };
        }

        const donhang = await adminOrderDAO.layChiTietDonHang(donhangId);
        if (!donhang) {
            throw { status: 404, message: "Khong tim thay don hang" };
        }

        const affectedRows = await adminOrderDAO.capNhatTrangThaiThanhToan(donhangId, trangthaiMoi);
        if (affectedRows <= 0) {
            throw { status: 400, message: "Khong the cap nhat trang thai thanh toan" };
        }

        return {
            donhang_id: Number(donhangId),
            trangthai_thanhtoan_cu: donhang.trangthai_thanhtoan,
            trangthai_thanhtoan_moi: trangthaiMoi
        };
    }
}

export default new AdminOrderService();
