-- --------------------------------------------------------
-- Máy chủ:                      127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Phiên bản:           12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for btapweb_v2
CREATE DATABASE IF NOT EXISTS `btapweb_v2` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `btapweb_v2`;

-- Dumping structure for table btapweb_v2.bienthesp
CREATE TABLE IF NOT EXISTS `bienthesp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sanpham_id` int NOT NULL,
  `ma_sku` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã SKU riêng của biến thể',
  `kichthuoc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mausac` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soluong` int NOT NULL DEFAULT '0' COMMENT 'Tồn kho',
  `gia_nhap` int DEFAULT NULL COMMENT 'Giá vốn nhập gần nhất',
  `hinhanh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh riêng của biến thể',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bienthe_sku` (`ma_sku`),
  KEY `idx_bienthe_sanpham` (`sanpham_id`),
  CONSTRAINT `fk_bienthe_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Biến thể sản phẩm';

-- Dumping data for table btapweb_v2.bienthesp: ~10 rows (approximately)
INSERT INTO `bienthesp` (`id`, `sanpham_id`, `ma_sku`, `kichthuoc`, `mausac`, `soluong`, `gia_nhap`, `hinhanh`) VALUES
	(1, 1, 'SP1-S-DEN', 'S', 'Đen', 50, 100000, NULL),
	(2, 1, 'SP1-M-DEN', 'M', 'Đen', 38, 100000, NULL),
	(3, 2, 'SP2-M-TRANG', 'M', 'Trắng', 30, 120000, NULL),
	(4, 3, 'SP3-30-XANH', '30', 'Xanh', 20, 300000, NULL),
	(5, 4, 'SP4-32-DEN', '32', 'Đen', 15, 320000, NULL),
	(6, 5, 'SP5-M-HOA', 'M', 'Hoa', 25, 200000, NULL),
	(7, 6, 'SP6-S-DEN', 'S', 'Đen', 20, 220000, NULL),
	(8, 7, 'SP7-L-XAM', 'L', 'Xám', 10, 400000, NULL),
	(9, 8, 'SP8-L-DEN', 'L', 'Đen', 12, 420000, NULL),
	(10, 1, 'SP1-L-Xanh', 'L', 'Xanh', 15, 120000, NULL);

-- Dumping structure for table btapweb_v2.chitietdonhang
CREATE TABLE IF NOT EXISTS `chitietdonhang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donhang_id` int NOT NULL,
  `sanpham_id` int NOT NULL,
  `bienthe_id` int DEFAULT NULL COMMENT 'NULL nếu SP không có biến thể',
  `tensanpham` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kichthuoc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mausac` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ma_sku` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dongia` decimal(15,2) NOT NULL COMMENT 'Giá thực tế lúc mua',
  `soluong` int NOT NULL DEFAULT '1',
  `thanhtien` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'dongia * soluong',
  PRIMARY KEY (`id`),
  KEY `idx_ctdh_donhang` (`donhang_id`),
  KEY `idx_ctdh_sanpham` (`sanpham_id`),
  KEY `idx_ctdh_bienthe` (`bienthe_id`),
  CONSTRAINT `fk_ctdh_bienthe` FOREIGN KEY (`bienthe_id`) REFERENCES `bienthesp` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ctdh_donhang` FOREIGN KEY (`donhang_id`) REFERENCES `donhang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctdh_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết đơn hàng';

-- Dumping data for table btapweb_v2.chitietdonhang: ~4 rows (approximately)
INSERT INTO `chitietdonhang` (`id`, `donhang_id`, `sanpham_id`, `bienthe_id`, `tensanpham`, `kichthuoc`, `mausac`, `ma_sku`, `dongia`, `soluong`, `thanhtien`) VALUES
	(1, 1, 1, 1, 'Áo thun basic đen', 'S', 'Đen', 'SP1-S-DEN', 150000.00, 2, 300000.00),
	(2, 1, 3, 4, 'Quần jean xanh', '30', 'Xanh', 'SP3-30-XANH', 500000.00, 1, 500000.00),
	(3, 2, 8, 9, 'Áo hoodie', 'L', 'Đen', NULL, 650000.00, 2, 1300000.00),
	(4, 2, 1, 2, 'Áo thun basic đen', 'M', 'Đen', NULL, 150000.00, 1, 150000.00),
	(5, 3, 1, 2, 'Áo thun basic đen', 'M', 'Đen', NULL, 150000.00, 2, 300000.00);

-- Dumping structure for table btapweb_v2.chitietphieunhap
CREATE TABLE IF NOT EXISTS `chitietphieunhap` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phieunhap_id` int NOT NULL,
  `bienthe_id` int NOT NULL,
  `soluong` int NOT NULL DEFAULT '1',
  `dongia` bigint NOT NULL COMMENT 'Giá nhập mỗi đơn vị',
  `thanhtien` bigint NOT NULL DEFAULT '0' COMMENT 'soluong * dongia',
  `ghichu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ctpn_phieunhap` (`phieunhap_id`),
  KEY `idx_ctpn_bienthe` (`bienthe_id`),
  CONSTRAINT `fk_ctpn_bienthe` FOREIGN KEY (`bienthe_id`) REFERENCES `bienthesp` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpn_phieunhap` FOREIGN KEY (`phieunhap_id`) REFERENCES `phieunhap` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết phiếu nhập kho';

-- Dumping data for table btapweb_v2.chitietphieunhap: ~0 rows (approximately)

-- Dumping structure for table btapweb_v2.danhgia
CREATE TABLE IF NOT EXISTS `danhgia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sanpham_id` int NOT NULL,
  `user_id` int NOT NULL,
  `donhang_id` int DEFAULT NULL COMMENT 'Đơn hàng đã mua (xác thực đã mua)',
  `sao` int NOT NULL DEFAULT (5),
  `tieude` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noidung` text COLLATE utf8mb4_unicode_ci,
  `trang_thai` enum('choxet','duyety','tuchoi') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'duyety' COMMENT 'Moderation: choxet / duyety / tuchoi',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_danhgia` (`user_id`,`sanpham_id`) COMMENT 'Mỗi user đánh giá 1 lần/SP',
  KEY `idx_danhgia_sanpham` (`sanpham_id`),
  KEY `idx_danhgia_donhang` (`donhang_id`),
  CONSTRAINT `fk_danhgia_donhang` FOREIGN KEY (`donhang_id`) REFERENCES `donhang` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_danhgia_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_danhgia_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_sao` CHECK ((`sao` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đánh giá sản phẩm';

-- Dumping data for table btapweb_v2.danhgia: ~0 rows (approximately)
INSERT INTO `danhgia` (`id`, `sanpham_id`, `user_id`, `donhang_id`, `sao`, `tieude`, `noidung`, `trang_thai`, `createdAt`) VALUES
	(1, 1, 2, NULL, 5, 'Rất tốt', 'Mặc cực thoải mái', 'duyety', '2026-03-25 09:48:19'),
	(2, 3, 2, NULL, 4, 'Ổn', 'Quần đẹp', 'duyety', '2026-03-25 09:48:19');

-- Dumping structure for table btapweb_v2.danhmuc
CREATE TABLE IF NOT EXISTS `danhmuc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL COMMENT 'NULL = danh mục gốc',
  `tendanhmuc` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Slug URL duy nhất',
  `mota` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thu_tu` tinyint NOT NULL DEFAULT '0' COMMENT 'Thứ tự hiển thị',
  `an_hien` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=hiển thị, 0=ẩn',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_danhmuc_slug` (`slug`),
  KEY `idx_danhmuc_parent` (`parent_id`),
  CONSTRAINT `fk_danhmuc_parent` FOREIGN KEY (`parent_id`) REFERENCES `danhmuc` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục sản phẩm (cây cha/con)';

-- Dumping data for table btapweb_v2.danhmuc: ~6 rows (approximately)
INSERT INTO `danhmuc` (`id`, `parent_id`, `tendanhmuc`, `slug`, `mota`, `thu_tu`, `an_hien`, `createdAt`) VALUES
	(1, NULL, 'Thời trang nam', 'thoi-trang-nam', NULL, 0, 1, '2026-03-25 09:46:41'),
	(2, NULL, 'Thời trang nữ', 'thoi-trang-nu', NULL, 0, 1, '2026-03-25 09:46:41'),
	(3, 1, 'Áo thun', 'ao-thun-nam', NULL, 0, 1, '2026-03-25 09:46:41'),
	(4, 1, 'Quần jean', 'quan-jean-nam', NULL, 0, 1, '2026-03-25 09:46:41'),
	(5, 2, 'Váy', 'vay-nu', NULL, 0, 1, '2026-03-25 09:46:41'),
	(6, 2, 'Áo khoác', 'ao-khoac-nu', NULL, 0, 1, '2026-03-25 09:46:41');

-- Dumping structure for table btapweb_v2.diachigiaohang
CREATE TABLE IF NOT EXISTS `diachigiaohang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tennguoinhan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sodienthoai` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `diachichitiet` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Số nhà, tên đường…',
  `phuong` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Phường / Xã',
  `quan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Quận / Huyện',
  `tinh` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tỉnh / Thành phố',
  `macdinh` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = địa chỉ mặc định',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft-delete',
  PRIMARY KEY (`id`),
  KEY `idx_diachi_user` (`user_id`),
  CONSTRAINT `fk_diachi_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Địa chỉ giao hàng';

-- Dumping data for table btapweb_v2.diachigiaohang: ~3 rows (approximately)
INSERT INTO `diachigiaohang` (`id`, `user_id`, `tennguoinhan`, `sodienthoai`, `diachichitiet`, `phuong`, `quan`, `tinh`, `macdinh`, `deleted_at`) VALUES
	(1, 2, 'Thành', '0123456688', '8910 JQK', 'hạ đình', 'quận 1', 'Ho Chi Minh', 1, NULL),
	(2, 3, 'ssac', '0987654321', 'ácx', 'sdzx sd', 'sdc', 'szc', 1, NULL),
	(3, 1, 'Nguyen Van A', '0912345678', '123 Duong ABC', 'Phuong 1', 'Quan 1', 'TP HCM', 1, NULL);

-- Dumping structure for table btapweb_v2.donhang
CREATE TABLE IF NOT EXISTS `donhang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_donhang` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã đơn tham chiếu (VD: DH20260101001)',
  `user_id` int NOT NULL,
  `diachi_id` int DEFAULT NULL COMMENT 'NULL nếu địa chỉ đã bị xóa',
  `voucher_id` int DEFAULT NULL COMMENT 'NULL nếu không dùng voucher',
  `snapshot_diachi` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON snapshot địa chỉ lúc đặt',
  `ghichu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lydo_huy` text COLLATE utf8mb4_unicode_ci,
  `trangthai` enum('choxacnhan','daxacnhan','dangxuly','danggiao','dagiao','dahuy') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'choxacnhan',
  `phuongthuc_thanhtoan` enum('tienmat','chuyenkhoan','vnpay','momo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tienmat',
  `trangthai_thanhtoan` enum('chuathanhtoan','dathanhtoan','hoantien') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chuathanhtoan',
  `tongtienhang` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Tổng tiền hàng (trước giảm)',
  `giam_gia` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Số tiền được giảm từ voucher',
  `phivanchuyen` decimal(15,2) NOT NULL DEFAULT '30000.00',
  `tongthanhtoan` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Sau giảm + phí ship',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_donhang_ma` (`ma_donhang`),
  KEY `idx_donhang_user` (`user_id`),
  KEY `idx_donhang_trangthai` (`trangthai`),
  KEY `idx_donhang_diachi` (`diachi_id`),
  KEY `idx_donhang_voucher` (`voucher_id`),
  CONSTRAINT `fk_donhang_diachi` FOREIGN KEY (`diachi_id`) REFERENCES `diachigiaohang` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_donhang_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_donhang_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đơn hàng';

-- Dumping data for table btapweb_v2.donhang: ~3 rows (approximately)
INSERT INTO `donhang` (`id`, `ma_donhang`, `user_id`, `diachi_id`, `voucher_id`, `snapshot_diachi`, `ghichu`, `lydo_huy`, `trangthai`, `phuongthuc_thanhtoan`, `trangthai_thanhtoan`, `tongtienhang`, `giam_gia`, `phivanchuyen`, `tongthanhtoan`, `createdAt`, `updatedAt`) VALUES
	(1, 'DH001', 2, 1, NULL, NULL, NULL, NULL, 'choxacnhan', 'tienmat', 'chuathanhtoan', 700000.00, 0.00, 30000.00, 730000.00, '2026-03-25 09:48:19', '2026-03-25 09:48:19'),
	(2, 'DH1774810617357', 3, 2, NULL, '{"tennguoinhan":"ssac","sodienthoai":"0987654321","diachichitiet":"ácx","phuong":"sdzx sd","quan":"sdc","tinh":"szc"}', NULL, 'Thay đổi ý định mua hàng', 'dahuy', 'tienmat', 'chuathanhtoan', 1450000.00, 0.00, 0.00, 1450000.00, '2026-03-29 18:56:57', '2026-03-29 18:57:17'),
	(3, 'DH1774814845571', 3, 2, NULL, '{"tennguoinhan":"ssac","sodienthoai":"0987654321","diachichitiet":"ácx","phuong":"sdzx sd","quan":"sdc","tinh":"szc"}', NULL, NULL, 'choxacnhan', 'tienmat', 'chuathanhtoan', 300000.00, 0.00, 0.00, 300000.00, '2026-03-29 20:07:25', '2026-03-29 20:07:25');

-- Dumping structure for table btapweb_v2.giohang
CREATE TABLE IF NOT EXISTS `giohang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sanpham_id` int NOT NULL,
  `bienthe_id` int DEFAULT NULL,
  `soluong` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_giohang` (`user_id`,`sanpham_id`,`bienthe_id`),
  KEY `idx_giohang_user` (`user_id`),
  KEY `idx_giohang_sanpham` (`sanpham_id`),
  KEY `idx_giohang_bienthe` (`bienthe_id`),
  CONSTRAINT `fk_giohang_bienthe` FOREIGN KEY (`bienthe_id`) REFERENCES `bienthesp` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_giohang_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_giohang_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Giỏ hàng';

-- Dumping data for table btapweb_v2.giohang: ~3 rows (approximately)
INSERT INTO `giohang` (`id`, `user_id`, `sanpham_id`, `bienthe_id`, `soluong`) VALUES
	(1, 2, 1, 1, 2),
	(2, 2, 3, 4, 1);

-- Dumping structure for table btapweb_v2.hinhanh_sanpham
CREATE TABLE IF NOT EXISTS `hinhanh_sanpham` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sanpham_id` int NOT NULL,
  `ten_file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên file hoặc URL ảnh',
  `thu_tu` tinyint NOT NULL DEFAULT '0' COMMENT 'Thứ tự hiển thị',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hinhanh_sanpham` (`sanpham_id`),
  CONSTRAINT `fk_hinhanh_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ảnh phụ của sản phẩm';

-- Dumping data for table btapweb_v2.hinhanh_sanpham: ~8 rows (approximately)
INSERT INTO `hinhanh_sanpham` (`id`, `sanpham_id`, `ten_file`, `thu_tu`, `createdAt`) VALUES
	(1, 1, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c', 0, '2026-03-25 09:46:42'),
	(2, 2, 'https://images.unsplash.com/photo-1520975922284-9c4c0b0c6a16', 0, '2026-03-25 09:46:42'),
	(3, 3, 'https://images.unsplash.com/photo-1523381294911-8d3cead13475', 0, '2026-03-25 09:46:42'),
	(4, 4, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', 0, '2026-03-25 09:46:42'),
	(5, 5, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c', 0, '2026-03-25 09:46:42'),
	(6, 6, 'https://images.unsplash.com/photo-1520975916090-3105956dac38', 0, '2026-03-25 09:46:42'),
	(7, 7, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 0, '2026-03-25 09:46:42'),
	(8, 8, 'https://images.unsplash.com/photo-1514996937319-344454492b37', 0, '2026-03-25 09:46:42');

-- Dumping structure for table btapweb_v2.lichsu_donhang
CREATE TABLE IF NOT EXISTS `lichsu_donhang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donhang_id` int NOT NULL,
  `nguoidung_id` int DEFAULT NULL COMMENT 'Admin hoặc user thực hiện thay đổi',
  `trangthai_cu` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NULL = lúc tạo đơn',
  `trangthai_moi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ghichu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lsdh_donhang` (`donhang_id`),
  KEY `fk_lsdh_nguoidung` (`nguoidung_id`),
  CONSTRAINT `fk_lsdh_donhang` FOREIGN KEY (`donhang_id`) REFERENCES `donhang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lsdh_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử trạng thái đơn hàng';

-- Dumping data for table btapweb_v2.lichsu_donhang: ~2 rows (approximately)
INSERT INTO `lichsu_donhang` (`id`, `donhang_id`, `nguoidung_id`, `trangthai_cu`, `trangthai_moi`, `ghichu`, `createdAt`) VALUES
	(1, 2, 3, NULL, 'choxacnhan', 'Đặt hàng mới', '2026-03-29 18:56:57'),
	(2, 2, 3, NULL, 'dahuy', 'Thay đổi ý định mua hàng', '2026-03-29 18:57:17'),
	(3, 3, 3, NULL, 'choxacnhan', 'Đặt hàng mới', '2026-03-29 20:07:25');

-- Dumping structure for table btapweb_v2.phieunhap
CREATE TABLE IF NOT EXISTS `phieunhap` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nguoitao_id` int DEFAULT NULL COMMENT 'Admin tạo phiếu',
  `nha_cung_cap` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên nhà cung cấp',
  `tongtien` bigint NOT NULL DEFAULT '0',
  `ghichu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_phieunhap_user` (`nguoitao_id`),
  CONSTRAINT `fk_phieunhap_user` FOREIGN KEY (`nguoitao_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu nhập kho';

-- Dumping data for table btapweb_v2.phieunhap: ~0 rows (approximately)

-- Dumping structure for table btapweb_v2.sanpham
CREATE TABLE IF NOT EXISTS `sanpham` (
  `id` int NOT NULL AUTO_INCREMENT,
  `danhmuc_id` int NOT NULL,
  `tensanpham` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(280) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Slug URL duy nhất',
  `thuonghieu` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Thương hiệu / nhà sản xuất',
  `mota` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả chi tiết (HTML/Markdown)',
  `giaban` decimal(15,2) NOT NULL COMMENT 'Giá bán gốc',
  `giakhuyenmai` decimal(15,2) DEFAULT NULL COMMENT 'NULL = không khuyến mãi',
  `hinhanh` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ảnh đại diện chính',
  `an_hien` tinyint unsigned NOT NULL DEFAULT '1',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft-delete: NULL = chưa xóa',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sanpham_slug` (`slug`),
  KEY `idx_sanpham_danhmuc` (`danhmuc_id`),
  KEY `idx_sanpham_deleted` (`deleted_at`),
  CONSTRAINT `fk_sanpham_danhmuc` FOREIGN KEY (`danhmuc_id`) REFERENCES `danhmuc` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sản phẩm';

-- Dumping data for table btapweb_v2.sanpham: ~8 rows (approximately)
INSERT INTO `sanpham` (`id`, `danhmuc_id`, `tensanpham`, `slug`, `thuonghieu`, `mota`, `giaban`, `giakhuyenmai`, `hinhanh`, `an_hien`, `deleted_at`, `createdAt`, `updatedAt`) VALUES
	(1, 3, 'Áo thun basic đen', 'ao-thun-den', 'Nike', 'Cotton 100%', 200000.00, 150000.00, 'anh1.jpg', 1, NULL, '2026-03-25 09:46:42', '2026-03-25 09:50:44'),
	(2, 3, 'Áo thun trắng', 'ao-thun-trang', 'Adidas', 'Thoáng mát', 220000.00, NULL, 'anh2.jpg', 1, NULL, '2026-03-25 09:46:42', '2026-03-25 09:50:53'),
	(3, 4, 'Quần jean xanh', 'jean-xanh', 'Levis', 'Co giãn', 500000.00, NULL, 'anh3.jpg', 1, NULL, '2026-03-25 09:46:42', '2026-03-25 09:54:11'),
	(4, 4, 'Quần jean đen', 'jean-den', 'Levis', 'Slimfit', 550000.00, 490000.00, 'anh4.jpg', 1, NULL, '2026-03-25 09:46:42', '2026-03-25 09:54:05'),
	(5, 5, 'Váy hoa', 'vay-hoa', 'Zara', 'Dịu dàng', 400000.00, 350000.00, 'anh5.jpg', 1, NULL, '2026-03-25 09:46:42', '2026-03-25 09:53:48'),
	(6, 5, 'Váy đen', 'vay-den', 'H&M', 'Thanh lịch', 450000.00, NULL, 'anh6.webp', 1, NULL, '2026-03-25 09:46:42', '2026-03-25 09:53:30'),
	(7, 6, 'Áo khoác nữ', 'ao-khoac-nu', 'Uniqlo', 'Giữ ấm', 600000.00, 550000.00, 'anh7.jpg', 1, NULL, '2026-03-25 09:46:42', '2026-03-25 09:53:54'),
	(8, 6, 'Áo hoodie', 'ao-hoodie', 'Nike', 'Street style', 650000.00, NULL, 'anh8.jpg', 1, NULL, '2026-03-25 09:46:42', '2026-03-25 09:54:00');

-- Dumping structure for table btapweb_v2.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên đăng nhập (duy nhất)',
  `password` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mật khẩu đã hash (bcrypt)',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email (duy nhất)',
  `fullname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Họ tên đầy đủ',
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sex` enum('Nam','Nữ') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaysinh` date DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên file ảnh đại diện',
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_username` (`username`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tài khoản người dùng';

-- Dumping data for table btapweb_v2.users: ~4 rows (approximately)
INSERT INTO `users` (`id`, `username`, `password`, `email`, `fullname`, `phone`, `sex`, `ngaysinh`, `avatar`, `role`, `status`, `createdAt`, `updatedAt`) VALUES
	(1, 'admin', '$2b$10$8fXtn1MtFC9vedkel8gZ9OMGL3fQegRWvubEsEoWHKNnmNjNVPIR6', 'admin@gmail.com', 'Admin', NULL, NULL, NULL, NULL, 'admin', 'active', '2026-03-25 09:46:42', '2026-03-29 19:56:39'),
	(2, 'user1', '$2b$10$abc', 'user1@gmail.com', 'Nguyễn Văn A', NULL, NULL, NULL, NULL, 'user', 'active', '2026-03-25 09:46:42', '2026-03-25 09:46:42'),
	(3, 'tamdt131005', '$2b$10$8fXtn1MtFC9vedkel8gZ9OMGL3fQegRWvubEsEoWHKNnmNjNVPIR6', 'tamdt131005@gmail.com', 'tamdt131005', NULL, NULL, NULL, NULL, 'user', 'active', '2026-03-26 05:55:35', '2026-03-26 05:55:35'),
	(4, 'new_user_test', '$2b$10$1oSirITyjGFJMdINKSbRu.N/6OO2C6TICt21PoNhbULIysKzksfQy', 'new_user_test@example.com', 'New User Test', NULL, NULL, NULL, NULL, 'user', 'active', '2026-03-29 20:24:04', '2026-03-29 20:24:04');

-- Dumping structure for table btapweb_v2.voucher
CREATE TABLE IF NOT EXISTS `voucher` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_voucher` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã nhập tại checkout (VD: SUMMER20)',
  `loai_giam` enum('phan_tram','so_tien') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'phan_tram',
  `gia_tri` decimal(15,2) NOT NULL COMMENT '% hoặc VND tùy loai_giam',
  `giam_toi_da` decimal(15,2) DEFAULT NULL COMMENT 'Trần giảm tối đa (áp dụng % giảm)',
  `don_hang_toi_thieu` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Giá trị đơn hàng tối thiểu',
  `so_luong` int NOT NULL DEFAULT '1' COMMENT 'Số lần sử dụng tối đa',
  `da_dung` int NOT NULL DEFAULT '0' COMMENT 'Đã được dùng bao nhiêu lần',
  `bat_dau` timestamp NOT NULL COMMENT 'Thời điểm bắt đầu hiệu lực',
  `ket_thuc` timestamp NOT NULL COMMENT 'Thời điểm hết hạn',
  `an_hien` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_voucher_ma` (`ma_voucher`),
  CONSTRAINT `chk_voucher_dates` CHECK ((`ket_thuc` > `bat_dau`)),
  CONSTRAINT `chk_voucher_soluong` CHECK ((`so_luong` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mã giảm giá / voucher';

-- Dumping data for table btapweb_v2.voucher: ~0 rows (approximately)
INSERT INTO `voucher` (`id`, `ma_voucher`, `loai_giam`, `gia_tri`, `giam_toi_da`, `don_hang_toi_thieu`, `so_luong`, `da_dung`, `bat_dau`, `ket_thuc`, `an_hien`, `createdAt`) VALUES
	(1, 'SALE10', 'phan_tram', 10.00, 50000.00, 0.00, 100, 0, '2026-03-25 09:48:19', '2026-04-24 09:48:19', 1, '2026-03-25 09:48:19');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
