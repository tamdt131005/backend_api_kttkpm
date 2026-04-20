import express from 'express';
import orderController from '../controller/order.controller.js';

const router = express.Router();

router.post('/', orderController.createOrder);

router.post('/momo/ipn', orderController.momoIpn);

router.get('/', orderController.getOrders);

router.get('/:id', orderController.getOrderById);

router.patch('/:id/cancel', orderController.cancelOrder);

export default router;