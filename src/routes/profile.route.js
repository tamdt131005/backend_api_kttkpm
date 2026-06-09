import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {validateProfile} from '../validation/profile.validate.js';
import ProfileController from '../controller/profile.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

const uploadDir = path.join(process.cwd(), 'src', 'upload', 'img', 'avatar');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname || '').toLowerCase();
		const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
		cb(null, `avatar_${Date.now()}${safeExt}`);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (file.mimetype && file.mimetype.startsWith('image/')) {
			cb(null, true);
			return;
		}
		cb(new Error('File không hợp lệ'));
	}
});

router.post('/avatar', upload.single('avatar'), ProfileController.uploadAvatar)

router.get('/:id',ProfileController.getProfile)
router.put('/',validateProfile,ProfileController.putProfile)

export default router;