import orderService from "../services/order.service.js";

const DEFAULT_FRONTEND_RETURN_URL = "http://localhost:8000/pages/profile/orders.html";

function shouldReturnJson(req) {
    const format = String(req.query?.format || "").trim().toLowerCase();
    if (format === "json") return true;

    const accept = String(req.headers?.accept || "").toLowerCase();
    return accept.includes("application/json");
}

function buildMomoReturnRedirectUrl(returnResult) {
    const configuredUrl =
        process.env.MOMO_FRONTEND_RETURN_URL ||
        process.env.FRONTEND_RETURN_URL ||
        DEFAULT_FRONTEND_RETURN_URL;

    let redirectUrl;
    try {
        redirectUrl = new URL(configuredUrl);
    } catch (_error) {
        redirectUrl = new URL(DEFAULT_FRONTEND_RETURN_URL);
    }

    redirectUrl.searchParams.set("momo_status", returnResult.success ? "success" : "failed");

    if (returnResult.orderId) {
        redirectUrl.searchParams.set("momo_order_id", String(returnResult.orderId));
    }

    if (returnResult.resultCode !== null && returnResult.resultCode !== undefined) {
        redirectUrl.searchParams.set("momo_result_code", String(returnResult.resultCode));
    }

    if (returnResult.message) {
        redirectUrl.searchParams.set("momo_message", String(returnResult.message));
    }

    const donhangId = Number(returnResult?.extraData?.order_id);
    if (Number.isInteger(donhangId) && donhangId > 0) {
        redirectUrl.searchParams.set("donhang_id", String(donhangId));
    }

    return redirectUrl.toString();
}

class OrderController {
    // POST /api/orders { user_id, diachi_id, ghichu, phuongthuc_thanhtoan }
    async createOrder(req, res) {
        try {
            const { user_id, diachi_id, ghichu, phuongthuc_thanhtoan, items } = req.body;
            if (!user_id || !diachi_id) {
                return res.status(400).json({ success: false, message: "Thiếu user_id hoặc diachi_id" });
            }

            const data = await orderService.createOrder(user_id, diachi_id, ghichu, phuongthuc_thanhtoan, items);
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

    // POST /api/orders/:id/momo { user_id }
    async createMomoPayment(req, res) {
        try {
            const orderId = req.params.id;
            const { user_id } = req.body;

            if (!user_id) {
                return res.status(400).json({ success: false, message: "Thiếu user_id" });
            }

            const data = await orderService.createMomoPayment(orderId, user_id);
            res.status(200).json({
                success: true,
                message: "Tao link thanh toan MoMo thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            console.error("Loi tao thanh toan MoMo:", error);
            res.status(status).json({ success: false, message: error.message || "Loi Server" });
        }
    }

    // POST /api/orders/momo/ipn
    async momoIpn(req, res) {
        try {
            const result = await orderService.handleMomoIpn(req.body);
            res.status(200).json({
                resultCode: 0,
                message: "IPN processed",
                data: result
            });
        } catch (error) {
            const resultCode = Number(error.resultCode || 99);
            res.status(200).json({
                resultCode,
                message: error.message || "IPN error"
            });
        }
    }

    // GET /api/orders/momo/return
    async momoReturn(req, res) {
        try {
            const result = await orderService.handleMomoReturn(req.query);

            if (shouldReturnJson(req)) {
                return res.status(200).json(result);
            }

            return res.redirect(302, buildMomoReturnRedirectUrl(result));
        } catch (error) {
            const status = error.status || 400;
            const failedResult = {
                success: false,
                orderId: req.query?.orderId ? String(req.query.orderId) : null,
                resultCode: Number.isFinite(Number(req.query?.resultCode)) ? Number(req.query.resultCode) : null,
                message: error.message || "Xu ly redirect MoMo that bai",
                extraData: null
            };

            if (shouldReturnJson(req)) {
                return res.status(status).json(failedResult);
            }

            return res.redirect(302, buildMomoReturnRedirectUrl(failedResult));
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
