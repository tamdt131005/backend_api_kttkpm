import orderService from "../services/order.service.js";

class OrderController {
    // POST /api/orders { user_id, diachi_id, ghichu, phuongthuc_thanhtoan }
    async createOrder(req, res) {
        try {
            const { user_id, diachi_id, ghichu, phuongthuc_thanhtoan } = req.body;
            if (!user_id || !diachi_id) {
                return res.status(400).json({ success: false, message: "Thiếu user_id hoặc diachi_id" });
            }

            const data = await orderService.createOrder(user_id, diachi_id, ghichu, phuongthuc_thanhtoan);
            res.status(201).json({
                success: true,
                message: "Đặt hàng thành công!",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            console.error("Lỗi đặt hàng:", error);
            res.status(status).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }

    // GET /api/orders?user_id=...
    async getOrders(req, res) {
        try {
            const userId = req.query.user_id;
            if (!userId) return res.status(400).json({ success: false, message: "Thiếu user_id" });

            const data = await orderService.getOrders(userId);
            res.status(200).json({ success: true, message: "Lấy danh sách đơn hàng thành công", data });
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }

    // GET /api/orders/:id?user_id=...
    async getOrderById(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.query.user_id;
            if (!userId) return res.status(400).json({ success: false, message: "Thiếu user_id" });

            const data = await orderService.getOrderById(orderId, userId);
            res.status(200).json({ success: true, message: "Lấy chi tiết đơn hàng thành công", data });
        } catch (error) {
            const status = error.status || 500;
            console.error("Lỗi lấy chi tiết đơn:", error);
            res.status(status).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }

    async cancelOrder(req, res) {
        try {
            const orderId = req.params.id;
            const { user_id, lydo_huy } = req.body;

            if (!user_id) {
                return res.status(400).json({ success: false, message: "Thiếu user_id" });
            }

            await orderService.cancelOrder(orderId, user_id, lydo_huy);
            res.status(200).json({ success: true, message: "Hủy đơn hàng thành công" });
        } catch (error) {
            const status = error.status || 500;
            console.error("Lỗi hủy đơn hàng:", error);
            res.status(status).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }
}

export default new OrderController();
