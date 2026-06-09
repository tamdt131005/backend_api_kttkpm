import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import adminController from "../controller/admin.controller.js";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken, verifyAdmin);

const productImageUploadDir = path.join(process.cwd(), "src", "upload", "img", "product");
if (!fs.existsSync(productImageUploadDir)) {
	fs.mkdirSync(productImageUploadDir, { recursive: true });
}

const productImageStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, productImageUploadDir);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname || "").toLowerCase();
		const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
		cb(null, `product_${Date.now()}${safeExt}`);
	}
});

const uploadProductImage = multer({
	storage: productImageStorage,
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (file.mimetype && file.mimetype.startsWith("image/")) {
			cb(null, true);
			return;
		}
		cb(new Error("File khong hop le"));
	}
});

router.get("/dashboard", adminController.getDashboard);

router.get("/donhang", adminController.getDonHang);
router.get("/donhang/:id", adminController.getChiTietDonHang);
router.patch("/donhang/:id/trangthai", adminController.capNhatTrangThaiDonHang);
router.patch("/donhang/:id/trangthai-thanhtoan", adminController.capNhatTrangThaiThanhToan);

router.get("/danhmuc", adminController.getDanhMuc);
router.get("/danhmuc/:id", adminController.getDanhMucById);
router.post("/danhmuc", adminController.themDanhMuc);
router.put("/danhmuc/:id", adminController.capNhatDanhMuc);
router.delete("/danhmuc/:id", adminController.xoaDanhMuc);

router.get("/sanpham", adminController.getSanPham);
router.get("/sanpham/:id", adminController.getSanPhamById);
router.post("/sanpham/upload-anh", uploadProductImage.single("hinhanh"), adminController.uploadAnhSanPham);
router.post("/sanpham", adminController.themSanPham);
router.put("/sanpham/:id", adminController.capNhatSanPham);
router.delete("/sanpham/:id", adminController.xoaSanPham);

router.get("/tonkho", adminController.getTonKho);

router.get("/nhaphang", adminController.getNhapHang);
router.post("/nhaphang", adminController.themPhieuNhap);

router.get("/bienthe", adminController.getBienThe);

export default router;
