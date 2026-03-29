import adminCategoryService from "../../services/admin/admin.category.service.js";

const adminCategoryController = {
    async getDanhMuc(req, res) {
        try {
            const { keyword = "" } = req.query;
            const data = await adminCategoryService.layDanhMuc(keyword);
            res.status(200).json({
                success: true,
                message: "Lay danh sach danh muc thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async getDanhMucById(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await adminCategoryService.layDanhMucById(id);
            res.status(200).json({
                success: true,
                message: "Lay chi tiet danh muc thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async themDanhMuc(req, res) {
        try {
            const data = await adminCategoryService.themDanhMuc(req.body || {});
            res.status(201).json({
                success: true,
                message: "Them danh muc thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async capNhatDanhMuc(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await adminCategoryService.capNhatDanhMuc(id, req.body || {});
            res.status(200).json({
                success: true,
                message: "Cap nhat danh muc thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async xoaDanhMuc(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await adminCategoryService.xoaDanhMuc(id);
            res.status(200).json({
                success: true,
                message: "Xoa danh muc thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    }
};

export default adminCategoryController;
