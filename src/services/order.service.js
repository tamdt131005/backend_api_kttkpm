import orderDAO from "../dao/order.dao.js";
import cartDAO from "../dao/cart.dao.js";
import addressDAO from "../dao/address.dao.js";
import pool from "../config/db.js";

class OrderService {
    async createOrder(user_id, diachi_id, ghichu, phuongthuc_thanhtoan) {
        // Lấy giỏ hàng
        const items = await cartDAO.getCartByUserId(user_id);
        if (!items || items.length === 0) {
            throw { status: 400, message: "Giỏ hàng trống" };
        }

        // Lấy địa chỉ giao hàng
        const address = await addressDAO.getAddressById(diachi_id, user_id);
        if (!address) {
            throw { status: 404, message: "Không tìm thấy địa chỉ giao hàng" };
        }

        const snapshot_diachi = JSON.stringify({
            tennguoinhan: address.tennguoinhan,
            sodienthoai: address.sodienthoai,
            diachichitiet: address.diachichitiet,
            phuong: address.phuong,
            quan: address.quan,
            tinh: address.tinh
        });

        // Tính tiền
        const tongtienhang = await cartDAO.getCartTotal(user_id);
        const phivanchuyen = 0; // Tạm thời miễn phí vận chuyển
        const tongthanhtoan = tongtienhang + phivanchuyen;
        const ma_donhang = "DH" + Date.now();

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const orderData = {
                ma_donhang,
                user_id,
                diachi_id,
                snapshot_diachi,
                ghichu,
                phuongthuc_thanhtoan,
                tongtienhang,
                phivanchuyen,
                tongthanhtoan
            };

            const donhangId = await orderDAO.createOrder(connection, orderData);

            // Chuẩn bị details
            const details = items.map(item => {
                const dongia = (item.giakhuyenmai !== null && item.giakhuyenmai > 0 && item.giakhuyenmai < item.giaban) 
                               ? Number(item.giakhuyenmai) : Number(item.giaban);
                return {
                    sanpham_id: item.sanpham_id,
                    bienthe_id: item.bienthe_id,
                    tensanpham: item.tensanpham,
                    kichthuoc: item.kichthuoc,
                    mausac: item.mausac,
                    ma_sku: null,
                    dongia: dongia,
                    soluong: item.soluong,
                    thanhtien: dongia * item.soluong
                };
            });

            await orderDAO.createOrderDetails(connection, donhangId, details);

            // Cập nhật tồn kho
            for (const item of items) {
                if (item.bienthe_id) {
                    await orderDAO.updateStock(connection, item.bienthe_id, item.soluong);
                }
            }

            await orderDAO.addOrderHistory(connection, donhangId, user_id, 'cho_xac_nhan', 'Đặt hàng mới');

            // Xóa giỏ hàng
            await connection.execute(`DELETE FROM giohang WHERE user_id = ?`, [user_id]);

            await connection.commit();

            return { ma_donhang, tongthanhtoan };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getOrders(userId) {
        return await orderDAO.getOrdersByUserId(userId);
    }

    async getOrderById(orderId, userId) {
        const order = await orderDAO.getOrderById(orderId, userId);
        if (!order) {
            throw { status: 404, message: "Không tìm thấy đơn hàng" };
        }
        return order;
    }
}

export default new OrderService();
