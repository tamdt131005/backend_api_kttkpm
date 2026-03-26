import pool from "../config/db.js";
import orderDAO from "../dao/order.dao.js";
import cartDAO from "../dao/cart.dao.js";
import addressDAO from "../dao/address.dao.js";

class OrderService {
    /**
     * Tạo đơn hàng mới (dùng transaction)
     * Luồng: Lấy giỏ hàng → Validate → Tạo đơn → Tạo chi tiết → Trừ kho → Xóa giỏ
     */
    async createOrder(userId, diachiId, ghichu, phuongthucThanhtoan) {
        // 1. Lấy giỏ hàng
        const cartItems = await cartDAO.getCartByUserId(userId);
        if (!cartItems || cartItems.length === 0) {
            throw { status: 400, message: "Giỏ hàng trống, không thể đặt hàng" };
        }

        // 2. Lấy địa chỉ giao hàng
        const address = await addressDAO.getAddressById(diachiId, userId);
        if (!address) {
            throw { status: 400, message: "Địa chỉ giao hàng không hợp lệ" };
        }

        // 3. Tính tổng tiền
        let tongtienhang = 0;
        const orderItems = cartItems.map(item => {
            const giaban = Number(item.giaban) || 0;
            const giakm = Number(item.giakhuyenmai) || 0;
            const coGiam = giakm > 0 && giakm < giaban;
            const dongia = coGiam ? giakm : giaban;
            const thanhtien = dongia * item.soluong;
            tongtienhang += thanhtien;

            return {
                sanpham_id: item.sanpham_id,
                bienthe_id: item.bienthe_id,
                tensanpham: item.tensanpham,
                kichthuoc: item.kichthuoc,
                mausac: item.mausac,
                ma_sku: null,
                dongia,
                soluong: item.soluong,
                thanhtien
            };
        });

        const phivanchuyen = 30000;
        const tongthanhtoan = tongtienhang + phivanchuyen;
        const ma_donhang = 'DH' + Date.now();

        // Snapshot địa chỉ (lưu JSON để giữ lại nếu địa chỉ bị sửa/xóa sau này)
        const snapshot_diachi = JSON.stringify({
            tennguoinhan: address.tennguoinhan,
            sodienthoai: address.sodienthoai,
            diachichitiet: address.diachichitiet,
            phuong: address.phuong,
            quan: address.quan,
            tinh: address.tinh
        });

        // 4. Dùng transaction để đảm bảo toàn vẹn dữ liệu
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Tạo đơn hàng
            const donhangId = await orderDAO.createOrder(connection, {
                ma_donhang, user_id: userId, diachi_id: diachiId,
                snapshot_diachi, ghichu,
                phuongthuc_thanhtoan: phuongthucThanhtoan || 'tienmat',
                tongtienhang, phivanchuyen, tongthanhtoan
            });

            // Tạo chi tiết đơn hàng
            await orderDAO.createOrderDetails(connection, donhangId, orderItems);

            // Trừ tồn kho
            for (const item of orderItems) {
                if (item.bienthe_id) {
                    await orderDAO.updateStock(connection, item.bienthe_id, item.soluong);
                }
            }

            // Ghi lịch sử
            await orderDAO.addOrderHistory(connection, donhangId, userId, 'choxacnhan', 'Đặt hàng mới');

            // Xóa giỏ hàng
            await connection.execute('DELETE FROM giohang WHERE user_id = ?', [userId]);

            await connection.commit();

            return {
                donhang_id: donhangId,
                ma_donhang,
                tongthanhtoan
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Lấy danh sách đơn hàng
    async getOrders(userId) {
        return await orderDAO.getOrdersByUserId(userId);
    }

    // Lấy chi tiết 1 đơn
    async getOrderById(orderId, userId) {
        const order = await orderDAO.getOrderById(orderId, userId);
        if (!order) {
            throw { status: 404, message: "Không tìm thấy đơn hàng" };
        }
        return order;
    }
}

export default new OrderService();
