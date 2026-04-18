import adminOrderDAO from "../../dao/admin/admin.order.dao.js";
import {
    chuanHoaTrangThaiDonHang,
    chuanHoaTrangThaiThanhToan,
    layTrangThaiTiepTheo,
    thuTuTrangThai,
    trangThaiThanhToanHopLe
} from "./admin.shared.js";

function chuanHoaDuLieuDonHang(donhang) {
    if (!donhang || typeof donhang !== "object") {
        return donhang;
    }

    const trangThaiDonHang = chuanHoaTrangThaiDonHang(donhang.trangthai) || donhang.trangthai;
    const trangThaiThanhToanNguon = donhang.trangthai_thanhtoan || donhang.trangthaithanhtoan;
    const trangThaiThanhToan =
        chuanHoaTrangThaiThanhToan(trangThaiThanhToanNguon) || trangThaiThanhToanNguon;

    return {
        ...donhang,
        trangthai: trangThaiDonHang,
        trangthai_thanhtoan: trangThaiThanhToan,
        trangthaithanhtoan: trangThaiThanhToan
    };
}

class AdminOrderService {
    async layDanhSachDonHang(trangthai = "all", keyword = "") {
        const trangThaiLoc = chuanHoaTrangThaiDonHang(trangthai, { allowAll: true });
        if (!trangThaiLoc) {
            throw { status: 400, message: "Trang thai khong hop le" };
        }

        const danhSachRaw = await adminOrderDAO.layTatCaDonHang(trangThaiLoc, keyword);
        const danhsach = danhSachRaw.map(chuanHoaDuLieuDonHang);
        const thongke = await adminOrderDAO.thongKeDonHang();
        const tongdoanhthu = await adminOrderDAO.layTongDoanhThu();
        return {
            danhsach,
            thongke,
            tongdoanhthu
        };
    }

    async layChiTietDonHang(donhangId) {
        const donhangRaw = await adminOrderDAO.layChiTietDonHang(donhangId);
        if (!donhangRaw) {
            throw { status: 404, message: "Khong tim thay don hang" };
        }

        const donhang = chuanHoaDuLieuDonHang(donhangRaw);

        return {
            ...donhang,
            trangthai_tiep_theo: layTrangThaiTiepTheo(donhang.trangthai)
        };
    }

    async capNhatTrangThaiDonHang(donhangId, trangthaiMoi, nguoidungId = null) {
        const trangThaiMoiDaChuanHoa = chuanHoaTrangThaiDonHang(trangthaiMoi);
        if (!Object.prototype.hasOwnProperty.call(thuTuTrangThai, trangThaiMoiDaChuanHoa || "")) {
            throw { status: 400, message: "Trang thai khong hop le" };
        }

        const donhangRaw = await adminOrderDAO.layChiTietDonHang(donhangId);
        if (!donhangRaw) {
            throw { status: 404, message: "Khong tim thay don hang" };
        }

        const donhang = chuanHoaDuLieuDonHang(donhangRaw);
        const trangThaiHienTai = chuanHoaTrangThaiDonHang(donhang.trangthai);

        if (trangThaiHienTai === "dagiao") {
            throw { status: 400, message: "Don hang da hoan thanh" };
        }

        if (trangThaiHienTai === "dahuy") {
            throw { status: 400, message: "Don hang da huy" };
        }

        const indexHienTai = thuTuTrangThai[trangThaiHienTai];
        const indexMoi = thuTuTrangThai[trangThaiMoiDaChuanHoa];

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
            const trangthaiTiepTheo = layTrangThaiTiepTheo(trangThaiHienTai);
            throw {
                status: 400,
                message: `Chi co the chuyen sang trang thai tiep theo: ${trangthaiTiepTheo}`
            };
        }

        const affectedRows = await adminOrderDAO.capNhatTrangThaiDonHang(donhangId, trangThaiMoiDaChuanHoa);
        if (affectedRows <= 0) {
            throw { status: 400, message: "Khong the cap nhat trang thai" };
        }

        await adminOrderDAO.themLichSuDonHang(
            donhangId,
            nguoidungId,
            trangThaiHienTai,
            trangThaiMoiDaChuanHoa,
            "Cap nhat trang thai boi admin"
        );

        return {
            donhang_id: Number(donhangId),
            trangthai_cu: trangThaiHienTai,
            trangthai_moi: trangThaiMoiDaChuanHoa
        };
    }

    async capNhatTrangThaiThanhToan(donhangId, trangthaiMoi) {
        const trangThaiMoiDaChuanHoa = chuanHoaTrangThaiThanhToan(trangthaiMoi);
        if (!trangThaiMoiDaChuanHoa || !trangThaiThanhToanHopLe.includes(trangThaiMoiDaChuanHoa)) {
            throw { status: 400, message: "Trang thai thanh toan khong hop le" };
        }

        const donhangRaw = await adminOrderDAO.layChiTietDonHang(donhangId);
        if (!donhangRaw) {
            throw { status: 404, message: "Khong tim thay don hang" };
        }

        const donhang = chuanHoaDuLieuDonHang(donhangRaw);

        const affectedRows = await adminOrderDAO.capNhatTrangThaiThanhToan(donhangId, trangThaiMoiDaChuanHoa);
        if (affectedRows <= 0) {
            throw { status: 400, message: "Khong the cap nhat trang thai thanh toan" };
        }

        return {
            donhang_id: Number(donhangId),
            trangthai_thanhtoan_cu: donhang.trangthai_thanhtoan || donhang.trangthaithanhtoan,
            trangthai_thanhtoan_moi: trangThaiMoiDaChuanHoa
        };
    }
}

export default new AdminOrderService();
