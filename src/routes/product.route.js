import express from 'express';
import userProductsController from '../controller/user.productsController.js';
import { validateProductId, validateCategoryId } from '../validation/product.validate.js';

const router = express.Router();

router.get('/', userProductsController.index);
router.get('/:id', validateProductId, userProductsController.detail);
router.get('/category/:category_id', validateCategoryId, userProductsController.getProductsByCategoryId);

export default router;
