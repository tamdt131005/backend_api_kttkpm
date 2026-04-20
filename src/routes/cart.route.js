import express from 'express';
import cartController from '../controller/cart.controller.js';

const router = express.Router();

router.get('/', cartController.getCart);

router.post('/', cartController.addToCart);

router.put('/:id', cartController.updateCartItem);

router.delete('/:id', cartController.removeCartItem);

export default router;
