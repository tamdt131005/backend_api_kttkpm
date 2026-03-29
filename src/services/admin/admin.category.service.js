import adminCategoryDAO from "../../dao/admin/admin.category.dao.js";
import { taoSlug } from "./admin.shared.js";

class AdminCategoryService {
    async layDanhMuc(keyword = "") {
        const danhsach = await adminCategoryDAO.layDanhMuc(keyword);
        const thongke = await adminCategoryDAO.layThongKeDanhMuc();
        return {
            danhsach,
            thongke
        };
    }

    async layDanhMucById(id) {
        const danhmuc = await adminCategoryDAO.layDanhMucById(id);
        if (!danhmuc) {
            throw { status: 404, message: "Khong tim thay danh muc" };
        }
        return danhmuc;
    }

    async themDanhMuc(payload) {
        const tendanhmuc = String(payload.tendanhmuc || "").trim();
        const mota = String(payload.mota || "").trim();

        if (!tendanhmuc) {
            throw { status: 400, message: "Vui long nhap ten danh muc" };
        }

        const trungTen = await adminCategoryDAO.kiemTraTrungTenDanhMuc(tendanhmuc);
        if (trungTen) {
            throw { status: 400, message: "Ten danh muc da ton tai" };
        }

        const slug = taoSlug(tendanhmuc);
        const id = await adminCategoryDAO.themDanhMuc({ tendanhmuc, slug, mota });

        return {
            danhmuc_id: id,
            tendanhmuc,
            slug,
            mota
        };
    }

    async capNhatDanhMuc(id, payload) {
        const tendanhmuc = String(payload.tendanhmuc || "").trim();
        const mota = String(payload.mota || "").trim();

        if (!tendanhmuc) {
            throw { status: 400, message: "Vui long nhap ten danh muc" };
        }

        const danhmuc = await adminCategoryDAO.layDanhMucById(id);
        if (!danhmuc) {
            throw { status: 404, message: "Danh muc khong ton tai" };
        }

        const trungTen = await adminCategoryDAO.kiemTraTrungTenDanhMuc(tendanhmuc, id);
        if (trungTen) {
            throw { status: 400, message: "Ten danh muc da ton tai" };
        }

        const slug = taoSlug(tendanhmuc);
        const affectedRows = await adminCategoryDAO.capNhatDanhMuc(id, { tendanhmuc, slug, mota });
        if (affectedRows <= 0) {
            throw { status: 400, message: "Khong the cap nhat danh muc" };
        }

        return {
            danhmuc_id: Number(id),
            tendanhmuc,
            slug,
            mota
        };
    }

    async xoaDanhMuc(id) {
        const danhmuc = await adminCategoryDAO.layDanhMucById(id);
        if (!danhmuc) {
            throw { status: 404, message: "Danh muc khong ton tai" };
        }

        const soSanPham = await adminCategoryDAO.demSanPhamTheoDanhMuc(id);
        if (soSanPham > 0) {
            throw {
                status: 400,
                message: "Danh muc dang co san pham, khong the xoa"
            };
        }

        const affectedRows = await adminCategoryDAO.xoaDanhMuc(id);
        if (affectedRows <= 0) {
            throw { status: 400, message: "Khong the xoa danh muc" };
        }

        return {
            danhmuc_id: Number(id)
        };
    }
}

export default new AdminCategoryService();
