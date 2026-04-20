import { json } from "express";
import orderService from "../services/order.service.js";

class OrderController {
    //user_id, diachi_id, ghichu, phuongthuc_thanhtoan
    async createOrder(req, res) {
        try {
            const {
                user_id: nguoiDungId,
                diachi_id: diaChiId,
                ghichu: ghiChu,
                phuongthuc_thanhtoan: phuongThucThanhToan,
                items: danhSachMuaNgay
            } = req.body;

            if (!nguoiDungId || !diaChiId) {
                return res.status(400).json({ success: false, message: "Thiếu user_id hoặc diachi_id" });
            }

            const duLieu = await orderService.createOrder(
                nguoiDungId,
                diaChiId,
                ghiChu,
                phuongThucThanhToan,
                danhSachMuaNgay
            );
            res.status(201).json({
                success: true,
                message: "Đặt hàng thành công!",
                data: duLieu
            });
        } catch (error) {
            const maTrangThai = error.status || 500;
            console.error("Lỗi đặt hàng:", error);
            res.status(maTrangThai).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }

    // orders?user_id=...
    async getOrders(req, res) {
        try {
            const nguoiDungId = req.query.user_id;
            if (!nguoiDungId) return res.status(400).json({ success: false, message: "Thiếu user_id" });

            const duLieu = await orderService.getOrders(nguoiDungId);
            res.status(200).json({ success: true, message: "Lấy danh sách đơn hàng thành công", data: duLieu });
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }

    //orders/:id?user_id=...
    async getOrderById(req, res) {
        try {
            const donHangId = req.params.id;
            const nguoiDungId = req.query.user_id;
            if (!nguoiDungId) return res.status(400).json({ success: false, message: "Thiếu user_id" });

            const duLieu = await orderService.getOrderById(donHangId, nguoiDungId);
            res.status(200).json({ success: true, message: "Lấy chi tiết đơn hàng thành công", data: duLieu });
        } catch (error) {
            const maTrangThai = error.status || 500;
            console.error("Lỗi lấy chi tiết đơn:", error);
            res.status(maTrangThai).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }

    //orders/momo/ipn
    async momoIpn(req, res) {
        try {
            const { orderId, resultCode } = req.body
            await orderService.updateTrangThaiMOMO(orderId, resultCode);
        } catch (error) {
            res.status(error.status).json({
                success: false,
                message: error.message
            })
        }

        res.status(200).json({
            success: true,
            message: "Thanh Toán Thành Công",
            rusltcode: 0
        });
    }
    async cancelOrder(req, res) {
        try {
            const donHangId = req.params.id;
            const { user_id: nguoiDungId, lydo_huy: lyDoHuy } = req.body;

            if (!nguoiDungId) {
                return res.status(400).json({ success: false, message: "Thiếu user_id" });
            }

            await orderService.cancelOrder(donHangId, nguoiDungId, lyDoHuy);
            res.status(200).json({ success: true, message: "Hủy đơn hàng thành công" });
        } catch (error) {
            const maTrangThai = error.status || 500;
            console.error("Lỗi hủy đơn hàng:", error);
            res.status(maTrangThai).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }
}

export default new OrderController();