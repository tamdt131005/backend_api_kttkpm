export const thuTuTrangThai = {
    choxacnhan: 0,
    daxacnhan: 1,
    dangxuly: 2,
    danggiao: 3,
    dagiao: 4
};

export const trangThaiThanhToanHopLe = ["chuathanhtoan", "dathanhtoan", "hoantien"];

export function taoSlug(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function layTrangThaiTiepTheo(trangthaiHienTai) {
    const danhSach = Object.keys(thuTuTrangThai);
    const indexHienTai = thuTuTrangThai[trangthaiHienTai];
    if (typeof indexHienTai !== "number") {
        return null;
    }

    if (indexHienTai >= danhSach.length - 1) {
        return null;
    }

    return danhSach[indexHienTai + 1];
}
