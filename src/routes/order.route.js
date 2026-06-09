import express from 'express';
import orderController from '../controller/order.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, orderController.createOrder);

router.post('/momo/ipn', orderController.momoIpn);

router.get('/', verifyToken, orderController.getOrders);

router.get('/:id', verifyToken, orderController.getOrderById);

router.patch('/:id/cancel', verifyToken, orderController.cancelOrder);

export default router;