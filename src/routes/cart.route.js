import express from 'express';
import cartController from '../controller/cart.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', cartController.getCart);

router.post('/', cartController.addToCart);

router.put('/:id', cartController.updateCartItem);

router.delete('/:id', cartController.removeCartItem);

export default router;
