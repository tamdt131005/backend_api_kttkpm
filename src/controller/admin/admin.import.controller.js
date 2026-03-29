import adminImportService from "../../services/admin/admin.import.service.js";

const adminImportController = {
    async getNhapHang(req, res) {
        try {
            const { keyword = "" } = req.query;
            const data = await adminImportService.layNhapHang(keyword);
            res.status(200).json({
                success: true,
                message: "Lay phieu nhap thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async themPhieuNhap(req, res) {
        try {
            const data = await adminImportService.themPhieuNhap(req.body || {});
            res.status(201).json({
                success: true,
                message: "Them phieu nhap thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    }
};

export default adminImportController;
