const danhSachTrangThaiTuanTu = ["choxacnhan", "dangxuly", "danggiao", "dagiao"];

export const thuTuTrangThai = danhSachTrangThaiTuanTu.reduce((acc, trangthai, index) => {
    acc[trangthai] = index;
    return acc;
}, {});

export const trangThaiThanhToanHopLe = ["chuathanhtoan", "dathanhtoan", "hoantien"];

const bangChuanHoaTrangThaiDonHang = {
    all: "all",
    tatca: "all",
    choxacnhan: "choxacnhan",
    daxacnhan: "dangxuly",
    dangxuly: "dangxuly",
    dangchuanbi: "dangxuly",
    danggiao: "danggiao",
    danggiaohang: "danggiao",
    dagiao: "dagiao",
    dagiaohang: "dagiao",
    hoanthanh: "dagiao",
    dahuy: "dahuy"
};

const bangChuanHoaTrangThaiThanhToan = {
    chuathanhtoan: "chuathanhtoan",
    dathanhtoan: "dathanhtoan",
    hoantien: "hoantien",
    dahoantien: "hoantien"
};

export function taoSlug(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function taoKhoaChuanHoa(value) {
    return taoSlug(value).replace(/-/g, "");
}

export function chuanHoaTrangThaiDonHang(value, { allowAll = false } = {}) {
    const khoa = taoKhoaChuanHoa(value);

    if (!khoa) {
        return allowAll ? "all" : null;
    }

    if (allowAll && (khoa === "all" || khoa === "tatca")) {
        return "all";
    }

    return bangChuanHoaTrangThaiDonHang[khoa] || null;
}

export function chuanHoaTrangThaiThanhToan(value) {
    const khoa = taoKhoaChuanHoa(value);
    if (!khoa) {
        return null;
    }

    return bangChuanHoaTrangThaiThanhToan[khoa] || null;
}

export function layTrangThaiTiepTheo(trangthaiHienTai) {
    const trangThaiDaChuanHoa = chuanHoaTrangThaiDonHang(trangthaiHienTai);
    const indexHienTai = thuTuTrangThai[trangThaiDaChuanHoa];
    if (typeof indexHienTai !== "number") {
        return null;
    }

    if (indexHienTai >= danhSachTrangThaiTuanTu.length - 1) {
        return null;
    }

    return danhSachTrangThaiTuanTu[indexHienTai + 1];
}
