import cartDAO from "../dao/cart.dao.js";

class CartService {
    // Lấy giỏ hàng + tổng tiền
    async getCart(userId) {
        const items = await cartDAO.getCartByUserId(userId);
        const tongtien = await cartDAO.getCartTotal(userId);
        return { items, tongtien };
    }

    // Thêm sản phẩm vào giỏ (nếu đã có thì cộng dồn)
    async addToCart(userId, sanphamId, bientheId, soluong = 1) {
        // Kiểm tra đã có trong giỏ chưa
        const existing = await cartDAO.findCartItem(userId, sanphamId, bientheId);

        if (existing) {
            // Cộng dồn số lượng
            const newQty = existing.soluong + soluong;
            await cartDAO.updateQuantity(existing.id, userId, newQty);
            return existing.id;
        }

        // Thêm mới
        return await cartDAO.addToCart(userId, sanphamId, bientheId, soluong);
    }

    // Cập nhật số lượng
    async updateCartItem(cartId, userId, soluong) {
        if (soluong <= 0) {
            throw { status: 400, message: "Số lượng phải lớn hơn 0" };
        }
        const result = await cartDAO.updateQuantity(cartId, userId, soluong);
        if (result === 0) {
            throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ" };
        }
        return result;
    }

    // Xóa 1 item
    async removeCartItem(cartId, userId) {
        const result = await cartDAO.removeCartItem(cartId, userId);
        if (result === 0) {
            throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ" };
        }
        return result;
    }

    // Xóa toàn bộ giỏ
    async clearCart(userId) {
        return await cartDAO.clearCart(userId);
    }
}

export default new CartService();
