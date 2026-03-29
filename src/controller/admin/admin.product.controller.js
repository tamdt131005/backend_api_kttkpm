import adminProductService from "../../services/admin/admin.product.service.js";

const adminProductController = {
    async getSanPham(req, res) {
        try {
            const { keyword = "" } = req.query;
            const data = await adminProductService.laySanPham(keyword);
            res.status(200).json({
                success: true,
                message: "Lay danh sach san pham thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async getSanPhamById(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await adminProductService.laySanPhamById(id);
            res.status(200).json({
                success: true,
                message: "Lay chi tiet san pham thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async themSanPham(req, res) {
        try {
            const data = await adminProductService.themSanPham(req.body || {});
            res.status(201).json({
                success: true,
                message: "Them san pham thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async capNhatSanPham(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await adminProductService.capNhatSanPham(id, req.body || {});
            res.status(200).json({
                success: true,
                message: "Cap nhat san pham thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async xoaSanPham(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await adminProductService.xoaSanPham(id);
            res.status(200).json({
                success: true,
                message: "Xoa san pham thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    }
};

export default adminProductController;
