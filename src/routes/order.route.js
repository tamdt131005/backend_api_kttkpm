import express from 'express';
import orderController from '../controller/order.controller.js';

const router = express.Router();

// POST /api/orders         → Tạo đơn hàng (đặt hàng)
router.post('/', orderController.createOrder);

// POST /api/orders/:id/momo { user_id } → Tạo link thanh toán MoMo cho đơn
router.post('/:id/momo', orderController.createMomoPayment);

// POST /api/orders/momo/ipn → MoMo callback server-to-server
router.post('/momo/ipn', orderController.momoIpn);

// GET /api/orders/momo/return → URL redirect sau thanh toán
router.get('/momo/return', orderController.momoReturn);

// GET  /api/orders?user_id=... → Lấy danh sách đơn hàng
router.get('/', orderController.getOrders);

// GET  /api/orders/:id?user_id=... → Chi tiết 1 đơn
router.get('/:id', orderController.getOrderById);

// PATCH /api/orders/:id/cancel { user_id, lydo_huy }
router.patch('/:id/cancel', orderController.cancelOrder);

export default router;
