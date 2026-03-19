import express from 'express';
import userController from '../controller/user.controller.js';

const router = express.Router();

// Định nghĩa các endpoint (tự động có prefix /api/users nới ta gắn nó ở index.js)
router.get('/', userController.index);
router.get('/:username', userController.detail);

export default router;
