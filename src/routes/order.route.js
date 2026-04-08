import express from 'express';
import orderController from '../controller/order.controller.js';

const router = express.Router();

// POST /api/orders         → Tạo đơn hàng (đặt hàng)
router.post('/', orderController.createOrder);

// POST /api/orders/momo/ipn → MoMo server-to-server callback (cập nhật trạng thái thanh toán)
router.post('/momo/ipn', orderController.momoIpn);

// GET  /api/orders?user_id=... → Lấy danh sách đơn hàng
router.get('/', orderController.getOrders);

// GET  /api/orders/:id?user_id=... → Chi tiết 1 đơn
router.get('/:id', orderController.getOrderById);

// PATCH /api/orders/:id/cancel { user_id, lydo_huy }
router.patch('/:id/cancel', orderController.cancelOrder);

export default router;