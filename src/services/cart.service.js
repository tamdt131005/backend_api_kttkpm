import cartDAO from "../dao/cart.dao.js";

class CartService {
    async getCart(userId) {
        const items = await cartDAO.getCartByUserId(userId);
        const tongtien = await cartDAO.getCartTotal(userId);
        return { items, tongtien };
    }

    async addToCart(userId, sanphamId, bientheId, soluong = 1) {
        if (soluong <= 0) {
            throw { status: 400, message: "Số lượng thêm vào phải lớn hơn 0" };
        }

        // Tìm item đã tồn tại trong giỏ hàng
        const tontai = await cartDAO.findCartItem(userId, sanphamId, bientheId);
        if (tontai) {
            throw { status: 400, message: "Sản phẩm đã có trong giỏ hàng" };
        }

        // Lấy tồn kho của biến thể
        let stock = 999999;
        if (bientheId) {
            stock = await cartDAO.getVariantStock(bientheId);
            if (soluong > stock) {
                throw { status: 400, message: `Số lượng vượt quá tồn kho của cửa hàng (Còn lại: ${stock})` };
            }
        }

        // Thêm mới vào giỏ hàng
        return await cartDAO.addToCart(userId, sanphamId, bientheId, soluong);
    }

    async updateCartItem(cartId, userId, soluong) {
        if (soluong <= 0) {
            throw { status: 400, message: "Số lượng phải lớn hơn 0" };
        }

        // Lấy thông tin dòng giỏ hàng
        const cartItem = await cartDAO.getCartItemById(cartId);
        if (!cartItem) {
            throw { status: 404, message: "Không tìm thấy sản phẩm trong giỏ" };
        }

        // Kiểm tra quyền sở hữu giỏ hàng
        if (cartItem.user_id !== Number(userId)) {
            throw { status: 403, message: "Bạn không có quyền chỉnh sửa giỏ hàng này" };
        }

        // Kiểm tra giới hạn tồn kho
        if (cartItem.bienthe_id) {
            const stock = await cartDAO.getVariantStock(cartItem.bienthe_id);
            if (soluong > stock) {
                throw { status: 400, message: `Số lượng vượt quá tồn kho của cửa hàng (Còn lại: ${stock})` };
            }
        }

        const result = await cartDAO.updateQuantity(cartId, userId, soluong);
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
