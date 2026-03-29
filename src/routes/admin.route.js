import express from "express";
import adminController from "../controller/admin.controller.js";

const router = express.Router();

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
router.post("/sanpham", adminController.themSanPham);
router.put("/sanpham/:id", adminController.capNhatSanPham);
router.delete("/sanpham/:id", adminController.xoaSanPham);

router.get("/tonkho", adminController.getTonKho);

router.get("/nhaphang", adminController.getNhapHang);
router.post("/nhaphang", adminController.themPhieuNhap);

router.get("/bienthe", adminController.getBienThe);

export default router;
