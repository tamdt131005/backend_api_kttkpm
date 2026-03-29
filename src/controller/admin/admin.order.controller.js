import adminOrderService from "../../services/admin/admin.order.service.js";

const adminOrderController = {
    async getDonHang(req, res) {
        try {
            const { trangthai = "all", keyword = "" } = req.query;
            const data = await adminOrderService.layDanhSachDonHang(trangthai, keyword);
            res.status(200).json({
                success: true,
                message: "Lay danh sach don hang thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async getChiTietDonHang(req, res) {
        try {
            const donhangId = Number(req.params.id);
            const data = await adminOrderService.layChiTietDonHang(donhangId);
            res.status(200).json({
                success: true,
                message: "Lay chi tiet don hang thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async capNhatTrangThaiDonHang(req, res) {
        try {
            const donhangId = Number(req.params.id);
            const { trangthai, nguoidung_id } = req.body;
            const data = await adminOrderService.capNhatTrangThaiDonHang(
                donhangId,
                String(trangthai || "").trim(),
                nguoidung_id ? Number(nguoidung_id) : null
            );
            res.status(200).json({
                success: true,
                message: "Cap nhat trang thai don hang thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    },

    async capNhatTrangThaiThanhToan(req, res) {
        try {
            const donhangId = Number(req.params.id);
            const { trangthai } = req.body;
            const data = await adminOrderService.capNhatTrangThaiThanhToan(
                donhangId,
                String(trangthai || "").trim()
            );
            res.status(200).json({
                success: true,
                message: "Cap nhat thanh toan thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    }
};

export default adminOrderController;
