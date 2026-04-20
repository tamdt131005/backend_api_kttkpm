import cartService from "../services/cart.service.js";

class CartController {
    async getCart(req, res) {
        try {
            const userId = req.query.user_id;
            if (!userId) {
                return res.status(400).json({ success: false, message: "Thiếu user_id" });
            }
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

    //user_id, sanpham_id, bienthe_id, soluong
    async addToCart(req, res) {
        try {
            const { user_id, sanpham_id, bienthe_id, soluong } = req.body;
            if (!user_id || !sanpham_id) {
                return res.status(400).json({ success: false, message: "Thiếu user_id hoặc sanpham_id" });
            }
            const cartId = await cartService.addToCart(user_id, sanpham_id, bienthe_id, soluong || 1);
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

    //user_id, soluong 
    async updateCartItem(req, res) {
        try {
            const cartId = req.params.id;
            const { user_id, soluong } = req.body;
            if (!user_id) {
                return res.status(400).json({ success: false, message: "Thiếu user_id" });
            }
            await cartService.updateCartItem(cartId, user_id, soluong);
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

    // id?user_id=...
    async removeCartItem(req, res) {
        try {
            const cartId = req.params.id;
            const userId = req.query.user_id;
            if (!userId) {
                return res.status(400).json({ success: false, message: "Thiếu user_id" });
            }
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
