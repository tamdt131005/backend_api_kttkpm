import express from 'express';
import cartController from '../controller/cart.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateAddToCart, validateUpdateCartItem, validateCartIdParam } from '../validation/cart.validate.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', cartController.getCart);

router.post('/', validateAddToCart, cartController.addToCart);

router.put('/:id', validateCartIdParam, validateUpdateCartItem, cartController.updateCartItem);

router.delete('/:id', validateCartIdParam, cartController.removeCartItem);

export default router;
