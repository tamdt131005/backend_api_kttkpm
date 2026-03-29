import adminProductDAO from "../../dao/admin/admin.product.dao.js";
import adminCategoryDAO from "../../dao/admin/admin.category.dao.js";
import { taoSlug } from "./admin.shared.js";

class AdminProductService {
    async laySanPham(keyword = "") {
        const danhsach = await adminProductDAO.laySanPham(keyword);
        const thongke = await adminProductDAO.layThongKeSanPham();
        return {
            danhsach,
            thongke
        };
    }

    async laySanPhamById(id) {
        const sanpham = await adminProductDAO.laySanPhamById(id);
        if (!sanpham) {
            throw { status: 404, message: "Khong tim thay san pham" };
        }
        return sanpham;
    }

    async themSanPham(payload) {
        const tensanpham = String(payload.tensanpham || "").trim();
        const danhmuc_id = Number(payload.danhmuc_id || 0);
        const thuonghieu = String(payload.thuonghieu || "").trim();
        const mota = String(payload.mota || "").trim();
        const giaban = Number(payload.giaban || 0);
        const giakhuyenmaiRaw = payload.giakhuyenmai;
        const giakhuyenmai = giakhuyenmaiRaw === "" || giakhuyenmaiRaw === null || typeof giakhuyenmaiRaw === "undefined"
            ? null
            : Number(giakhuyenmaiRaw);
        const hinhanh = String(payload.hinhanh || "").trim() || "placeholder.jpg";
        const an_hien = Number(payload.an_hien) === 0 ? 0 : 1;
        const soluong = Number(payload.soluong || 0);

        if (!tensanpham) {
            throw { status: 400, message: "Vui long nhap ten san pham" };
        }

        if (!Number.isInteger(danhmuc_id) || danhmuc_id <= 0) {
            throw { status: 400, message: "Danh muc khong hop le" };
        }

        if (!(giaban > 0)) {
            throw { status: 400, message: "Gia ban phai lon hon 0" };
        }

        if (giakhuyenmai !== null && !(giakhuyenmai >= 0)) {
            throw { status: 400, message: "Gia khuyen mai khong hop le" };
        }

        const tonTaiDanhMuc = await adminCategoryDAO.kiemTraDanhMucTonTai(danhmuc_id);
        if (!tonTaiDanhMuc) {
            throw { status: 400, message: "Danh muc khong ton tai" };
        }

        const slug = taoSlug(tensanpham);

        const sanpham_id = await adminProductDAO.themSanPham({
            danhmuc_id,
            tensanpham,
            slug,
            thuonghieu,
            mota,
            giaban,
            giakhuyenmai,
            hinhanh,
            an_hien
        });

        await adminProductDAO.upsertBienTheMacDinh(sanpham_id, soluong);

        return {
            sanpham_id,
            tensanpham,
            slug
        };
    }

    async capNhatSanPham(id, payload) {
        const sanphamCu = await adminProductDAO.laySanPhamById(id);
        if (!sanphamCu) {
            throw { status: 404, message: "San pham khong ton tai" };
        }

        const tensanpham = String(payload.tensanpham || "").trim();
        const danhmuc_id = Number(payload.danhmuc_id || 0);
        const thuonghieu = String(payload.thuonghieu || "").trim();
        const mota = String(payload.mota || "").trim();
        const giaban = Number(payload.giaban || 0);
        const giakhuyenmaiRaw = payload.giakhuyenmai;
        const giakhuyenmai = giakhuyenmaiRaw === "" || giakhuyenmaiRaw === null || typeof giakhuyenmaiRaw === "undefined"
            ? null
            : Number(giakhuyenmaiRaw);
        const hinhanh = String(payload.hinhanh || "").trim() || sanphamCu.hinhanh;
        const an_hien = Number(payload.an_hien) === 0 ? 0 : 1;
        const soluong = Number(payload.soluong);

        if (!tensanpham) {
            throw { status: 400, message: "Vui long nhap ten san pham" };
        }

        if (!Number.isInteger(danhmuc_id) || danhmuc_id <= 0) {
            throw { status: 400, message: "Danh muc khong hop le" };
        }

        if (!(giaban > 0)) {
            throw { status: 400, message: "Gia ban phai lon hon 0" };
        }

        if (giakhuyenmai !== null && !(giakhuyenmai >= 0)) {
            throw { status: 400, message: "Gia khuyen mai khong hop le" };
        }

        const tonTaiDanhMuc = await adminCategoryDAO.kiemTraDanhMucTonTai(danhmuc_id);
        if (!tonTaiDanhMuc) {
            throw { status: 400, message: "Danh muc khong ton tai" };
        }

        const slug = taoSlug(tensanpham);

        const affectedRows = await adminProductDAO.capNhatSanPham(id, {
            danhmuc_id,
            tensanpham,
            slug,
            thuonghieu,
            mota,
            giaban,
            giakhuyenmai,
            hinhanh,
            an_hien
        });

        if (affectedRows <= 0) {
            throw { status: 400, message: "Khong the cap nhat san pham" };
        }

        if (!Number.isNaN(soluong)) {
            await adminProductDAO.upsertBienTheMacDinh(id, soluong);
        }

        return {
            sanpham_id: Number(id),
            tensanpham,
            slug
        };
    }

    async xoaSanPham(id) {
        const sanphamCu = await adminProductDAO.laySanPhamById(id);
        if (!sanphamCu) {
            throw { status: 404, message: "San pham khong ton tai" };
        }

        const affectedRows = await adminProductDAO.xoaSanPham(id);
        if (affectedRows <= 0) {
            throw { status: 400, message: "Khong the xoa san pham" };
        }

        return {
            sanpham_id: Number(id)
        };
    }
}

export default new AdminProductService();
