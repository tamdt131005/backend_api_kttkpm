import express from 'express';
import cartController from '../controller/cart.controller.js';

const router = express.Router();

// GET  /api/cart?user_id=...       → Lấy giỏ hàng
router.get('/', cartController.getCart);

// POST /api/cart                   → Thêm sản phẩm vào giỏ
router.post('/', cartController.addToCart);

// PUT  /api/cart/:id               → Cập nhật số lượng
router.put('/:id', cartController.updateCartItem);

// DELETE /api/cart/:id?user_id=... → Xóa 1 item
router.delete('/:id', cartController.removeCartItem);

export default router;
