import adminStockService from "../../services/admin/admin.stock.service.js";

const adminStockController = {
    async getTonKho(req, res) {
        try {
            const { keyword = "", order = "asc", status = "" } = req.query;
            const data = await adminStockService.layTonKho(keyword, order, status);
            res.status(200).json({
                success: true,
                message: "Lay ton kho thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async getBienThe(req, res) {
        try {
            const { keyword = "" } = req.query;
            const data = await adminStockService.layDanhSachBienThe(keyword);
            res.status(200).json({
                success: true,
                message: "Lay danh sach bien the thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    }
};

export default adminStockController;
