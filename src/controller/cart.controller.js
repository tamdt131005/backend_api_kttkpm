import cartService from "../services/cart.service.js";

class CartController {
    async getCart(req, res) {
        try {
            const userId = req.user.id;
            const data = await cartService.getCart(userId);
            res.status(200).json({
                success: true,
                message: "Lấy giỏ hàng thành công",
                data
            });
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }

    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { sanpham_id, bienthe_id, soluong } = req.body;
            if (!sanpham_id) {
                return res.status(400).json({ success: false, message: "Thiếu sanpham_id" });
            }
            const cartId = await cartService.addToCart(userId, sanpham_id, bienthe_id, soluong || 1);
            res.status(201).json({
                success: true,
                message: "Thêm vào giỏ hàng thành công",
                data: { giohang_id: cartId }
            });
        } catch (error) {
            const status = error.status || 500;
            console.error("Lỗi thêm giỏ hàng:", error);
            res.status(status).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }

    async updateCartItem(req, res) {
        try {
            const userId = req.user.id;
            const cartId = req.params.id;
            const { soluong } = req.body;
            await cartService.updateCartItem(cartId, userId, soluong);
            res.status(200).json({
                success: true,
                message: "Cập nhật giỏ hàng thành công"
            });
        } catch (error) {
            const status = error.status || 500;
            console.error("Lỗi cập nhật giỏ hàng:", error);
            res.status(status).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }

    async removeCartItem(req, res) {
        try {
            const userId = req.user.id;
            const cartId = req.params.id;
            await cartService.removeCartItem(cartId, userId);
            res.status(200).json({
                success: true,
                message: "Xóa sản phẩm khỏi giỏ thành công"
            });
        } catch (error) {
            const status = error.status || 500;
            console.error("Lỗi xóa giỏ hàng:", error);
            res.status(status).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }
}

export default new CartController();
