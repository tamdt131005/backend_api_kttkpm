import express from 'express';
import addressController from '../controller/address.controller.js';

const router = express.Router();

// GET  /api/address?user_id=...         → Lấy danh sách địa chỉ
router.get('/', addressController.getAddresses);

// POST /api/address                     → Tạo địa chỉ mới
router.post('/', addressController.createAddress);

// PUT  /api/address/:id/default         → Đặt mặc định
router.put('/:id/default', addressController.setDefault);

export default router;
