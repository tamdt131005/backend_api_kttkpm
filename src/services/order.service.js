import orderDAO from "../dao/order.dao.js";
import cartDAO from "../dao/cart.dao.js";
import addressDAO from "../dao/address.dao.js";
import pool from "../config/db.js";
import momoService from "./momo.service.js";

class OrderService {
    parseMomoExtraData(rawExtraData) {
        if (!rawExtraData) return null;

        try {
            const decoded = Buffer.from(String(rawExtraData), "base64").toString("utf8");
            const parsed = JSON.parse(decoded);
            return typeof parsed === "object" && parsed !== null ? parsed : null;
        } catch (_error) {
            return null;
        }
    }

    async createOrder(user_id, diachi_id, ghichu, phuongthuc_thanhtoan, checkoutItems = null) {
        const thanhtoan = String(phuongthuc_thanhtoan || "tienmat").toLowerCase();
        const phuongthuc = thanhtoan === "momo" ? "chuyenkhoan" : thanhtoan;
        const loaithanhtoan = ["tienmat", "chuyenkhoan"];
        if (!loaithanhtoan.includes(phuongthuc)) {
            throw { status: 400, message: "Phuong thuc thanh toan khong hop le" };
        }

        let items = [];
        let tongtienhang = 0;
        const hasDirectItems = Array.isArray(checkoutItems) && checkoutItems.length > 0;

        if (hasDirectItems) {
            for (const rawItem of checkoutItems) {
                const sanphamId = Number(rawItem?.sanpham_id);
                const bientheId = rawItem?.bienthe_id !== undefined && rawItem?.bienthe_id !== null
                    ? Number(rawItem.bienthe_id)
                    : null;
                const soluong = Number(rawItem?.soluong || 0);

                if (!Number.isInteger(sanphamId) || sanphamId <= 0 || !Number.isInteger(soluong) || soluong <= 0) {
                    throw { status: 400, message: "Du lieu mua ngay khong hop le" };
                }

                const snapshot = await orderDAO.getProductSnapshotForOrderItem(sanphamId, bientheId);
                if (!snapshot) {
                    throw { status: 404, message: "Khong tim thay san pham dat hang" };
                }

                if (bientheId && Number(snapshot.soluong_kho || 0) < soluong) {
                    throw { status: 400, message: `San pham ${snapshot.tensanpham} khong du ton kho` };
                }

                const dongia = (snapshot.giakhuyenmai !== null && Number(snapshot.giakhuyenmai) > 0 && Number(snapshot.giakhuyenmai) < Number(snapshot.giaban))
                    ? Number(snapshot.giakhuyenmai)
                    : Number(snapshot.giaban);

                const detail = {
                    sanpham_id: snapshot.sanpham_id,
                    bienthe_id: snapshot.bienthe_id,
                    tensanpham: snapshot.tensanpham,
                    kichthuoc: snapshot.kichthuoc,
                    mausac: snapshot.mausac,
                    ma_sku: snapshot.ma_sku,
                    dongia,
                    soluong,
                    thanhtien: dongia * soluong
                };

                items.push(detail);
                tongtienhang += detail.thanhtien;
            }
        } else {
            const cartItems = await cartDAO.getCartByUserId(user_id);
            if (!cartItems || cartItems.length === 0) {
                throw { status: 400, message: "Giỏ hàng trống" };
            }

            items = cartItems.map(item => {
                const dongia = (item.giakhuyenmai !== null && item.giakhuyenmai > 0 && item.giakhuyenmai < item.giaban)
                    ? Number(item.giakhuyenmai)
                    : Number(item.giaban);
                const detail = {
                    sanpham_id: item.sanpham_id,
                    bienthe_id: item.bienthe_id,
                    tensanpham: item.tensanpham,
                    kichthuoc: item.kichthuoc,
                    mausac: item.mausac,
                    ma_sku: null,
                    dongia,
                    soluong: item.soluong,
                    thanhtien: dongia * item.soluong
                };

                tongtienhang += detail.thanhtien;
                return detail;
            });
        }

        if (!items || items.length === 0) {
            throw { status: 400, message: "Khong co san pham de dat hang" };
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

        const phivanchuyen = 0; 
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
                phuongthuc_thanhtoan: phuongthuc,
                tongtienhang,
                phivanchuyen,
                tongthanhtoan
            };

            const donhangId = await orderDAO.createOrder(connection, orderData);

            await orderDAO.createOrderDetails(connection, donhangId, items);

            // Cập nhật tồn kho
            for (const item of items) {
                if (item.bienthe_id) {
                    await orderDAO.updateTonkho(connection, item.bienthe_id, item.soluong);
                }
            }

            await orderDAO.addLichSuDonHang(connection, donhangId, user_id, 'choxacnhan', 'Đặt hàng mới');
            if (!hasDirectItems) {
                await connection.execute(`DELETE FROM giohang WHERE user_id = ?`, [user_id]);
            }

            await connection.commit();

            return { donhang_id: donhangId, ma_donhang, tongthanhtoan };
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

    async createMomoPayment(orderId, userId) {
        const order = await orderDAO.getOrderSummaryForPayment(orderId, userId);
        if (!order) {
            throw { status: 404, message: "Khong tim thay don hang" };
        }

        if (order.trangthai === "dahuy") {
            throw { status: 400, message: "Don hang da huy" };
        }

        if (order.trangthai_thanhtoan === "dathanhtoan") {
            throw { status: 400, message: "Don hang da thanh toan" };
        }

        if (order.phuongthuc_thanhtoan !== "chuyenkhoan") {
            throw { status: 400, message: "Don hang khong su dung thanh toan chuyen khoan" };
        }

        const amount = Math.round(Number(order.tongthanhtoan || 0));
        if (!Number.isFinite(amount) || amount <= 0) {
            throw { status: 400, message: "Gia tri don hang khong hop le" };
        }

        const extraData = Buffer.from(
            JSON.stringify({ order_id: order.id, user_id: Number(userId) })
        ).toString("base64");

        const momoResult = await momoService.createPayment({
            orderId: order.ma_donhang,
            amount,
            orderInfo: `Thanh toan don hang ${order.ma_donhang}`,
            extraData
        });

        if (Number(momoResult?.resultCode) !== 0) {
            throw {
                status: 400,
                message: momoResult?.message || "Tao thanh toan MoMo that bai"
            };
        }

        return {
            donhang_id: order.id,
            ma_donhang: order.ma_donhang,
            payUrl: momoResult.payUrl,
            deeplink: momoResult.deeplink || null,
            qrCodeUrl: momoResult.qrCodeUrl || null,
            raw: momoResult
        };
    }

    async handleMomoIpn(ipnData) {
        if (!momoService.verifyIpnSignature(ipnData)) {
            throw { status: 400, resultCode: 5, message: "Sai chu ky IPN" };
        }

        const maDonhang = ipnData?.orderId;
        if (!maDonhang) {
            throw { status: 400, resultCode: 6, message: "Thieu ma don hang" };
        }

        const order = await orderDAO.getOrderByCode(maDonhang);
        if (!order) {
            return {
                updated: false,
                message: "Order not found"
            };
        }

        const resultCode = Number(ipnData?.resultCode);
        if (resultCode === 0) {
            await orderDAO.markOrderPaidByCode(maDonhang);
        }

        return {
            updated: resultCode === 0,
            ma_donhang: maDonhang,
            resultCode
        };
    }

    async handleMomoReturn(returnData = {}) {
        const maDonhang = returnData?.orderId ? String(returnData.orderId) : null;
        const parsedResultCode = Number(returnData?.resultCode);
        const resultCode = Number.isFinite(parsedResultCode) ? parsedResultCode : null;
        const message = returnData?.message ? String(returnData.message) : null;

        // Redirect query from MoMo should contain a signature; verify when available.
        const hasSignature = Boolean(returnData?.signature);
        if (hasSignature && !momoService.verifyIpnSignature(returnData)) {
            throw { status: 400, resultCode: 5, message: "Sai chu ky return" };
        }

        if (resultCode === 0 && maDonhang) {
            await orderDAO.markOrderPaidByCode(maDonhang);
        }

        return {
            success: resultCode === 0,
            orderId: maDonhang,
            resultCode,
            message,
            extraData: this.parseMomoExtraData(returnData?.extraData)
        };
    }

    async getOrderById(orderId, userId) {
        const order = await orderDAO.getOrderById(orderId, userId);
        if (!order) {
            throw { status: 404, message: "Không tìm thấy đơn hàng" };
        }
        return order;
    }

    async cancelOrder(orderId, userId, lydoHuy) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const order = await orderDAO.getOrderRowForUser(connection, orderId, userId);
            if (!order) {
                throw { status: 404, message: "Không tìm thấy đơn hàng" };
            }

            if (order.trangthai !== 'choxacnhan') {
                throw { status: 400, message: "Chỉ được hủy đơn hàng ở trạng thái chờ xác nhận" };
            }

            const details = await orderDAO.getOrderItems(connection, orderId);
            for (const item of details) {
                if (item.bienthe_id) {
                    await orderDAO.restoreTonkho(connection, item.bienthe_id, item.soluong);
                }
            }

            const affectedRows = await orderDAO.cancelOrder(connection, orderId, lydoHuy);
            if (affectedRows <= 0) {
                throw { status: 400, message: "Không thể hủy đơn hàng" };
            }

            await orderDAO.addLichSuDonHang(
                connection,
                Number(orderId),
                Number(userId),
                'dahuy',
                lydoHuy || 'Người dùng hủy đơn'
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new OrderService();
