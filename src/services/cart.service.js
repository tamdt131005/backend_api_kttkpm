import cartDAO from "../dao/cart.dao.js";

class CartService {
    async getCart(userId) {
        const items = await cartDAO.getCartByUserId(userId);
        const tongtien = await cartDAO.getCartTotal(userId);
        return { items, tongtien };
    }

    async addToCart(userId, sanphamId, bientheId, soluong = 1) {
        const tontai = await cartDAO.findCartItem(userId, sanphamId);

        if (tontai) {
            throw { status: 400, message: "Sản phẩm đã có trong giỏ hàng" };
        }

        return await cartDAO.addToCart(userId, sanphamId, bientheId, soluong);
    }
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

    async removeCartItem(cartId, userId) {
        const result = await cartDAO.removeCartItem(cartId, userId);
        if (result === 0) {
            throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ" };
        }
        return result;
    }

    async clearCart(userId) {
        return await cartDAO.clearCart(userId);
    }
}

export default new CartService();
