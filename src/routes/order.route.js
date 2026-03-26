import express from 'express';
import orderController from '../controller/order.controller.js';

const router = express.Router();

// POST /api/orders         → Tạo đơn hàng (đặt hàng)
router.post('/', orderController.createOrder);

// GET  /api/orders?user_id=... → Lấy danh sách đơn hàng
router.get('/', orderController.getOrders);

// GET  /api/orders/:id?user_id=... → Chi tiết 1 đơn
router.get('/:id', orderController.getOrderById);

export default router;
