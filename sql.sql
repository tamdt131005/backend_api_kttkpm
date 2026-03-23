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


-- Dumping database structure for btapweb
CREATE DATABASE IF NOT EXISTS `btapweb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `btapweb`;

-- Dumping structure for table btapweb.bienthesp
CREATE TABLE IF NOT EXISTS `bienthesp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sanpham_id` int NOT NULL COMMENT 'Thuộc sản phẩm nào',
  `kichthuoc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kích thước (S/M/L/XL/29/30...)',
  `mausac` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Màu sắc',
  `soluong` int NOT NULL DEFAULT '0' COMMENT 'Tồn kho của biến thể này',
  `hinhanh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh riêng của biến thể (nếu có)',
  PRIMARY KEY (`id`),
  KEY `idx_bienthe_sanpham` (`sanpham_id`),
  CONSTRAINT `fk_bienthe_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Biến thể sản phẩm';

-- Dumping data for table btapweb.bienthesp: ~14 rows (approximately)
INSERT INTO `bienthesp` (`id`, `sanpham_id`, `kichthuoc`, `mausac`, `soluong`, `hinhanh`) VALUES
	(1, 1, 'M', 'Đen', 15, 'aothunnam.jpg'),
	(2, 1, 'L', 'Đen', 20, 'aothunnam.jpg'),
	(3, 1, 'XL', 'Trắng', 17, 'aothunnam.jpg'),
	(4, 2, 'M', 'Trắng', 10, 'ao_so_mi_trang_tay_dai.jpg'),
	(5, 2, 'L', 'Trắng', 15, 'ao_so_mi_trang_tay_dai.jpg'),
	(6, 2, 'XL', 'Trắng', 5, 'ao_so_mi_trang_tay_dai.jpg'),
	(7, 3, '29', 'Xanh đậm', 10, 'quan_jean_nam.png'),
	(8, 3, '30', 'Xanh đậm', 15, 'quan_jean_nam.png'),
	(9, 3, '31', 'Xanh nhạt', 15, 'quan_jean_nam.png'),
	(10, 4, '29', 'Be', 10, 'quan_haki.jpg'),
	(11, 4, '30', 'Xám', 10, 'quan_haki.jpg'),
	(12, 4, '31', 'Đen', 5, 'quan_haki.jpg'),
	(13, 5, 'Free Size', 'Nâu', 32, 'day_that_lung.webp'),
	(14, 5, 'Free Size', 'Đen', 30, 'day_that_lung.webp');

-- Dumping structure for table btapweb.chitietdonhang
CREATE TABLE IF NOT EXISTS `chitietdonhang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donhang_id` int NOT NULL,
  `sanpham_id` int NOT NULL,
  `bienthe_id` int DEFAULT NULL COMMENT 'Biến thể được chọn (NULL nếu SP không có biến thể)',
  `tensanpham` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên SP lúc mua (lưu lại phòng SP bị xóa/đổi tên)',
  `kichthuoc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kích thước lúc mua',
  `mausac` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Màu sắc lúc mua',
  `dongia` decimal(15,2) NOT NULL COMMENT 'Đơn giá lúc mua (giakhuyenmai ?: giaban)',
  `soluong` int NOT NULL DEFAULT '1',
  `thanhtien` decimal(15,2) GENERATED ALWAYS AS ((`dongia` * `soluong`)) STORED COMMENT 'Thành tiền = dongia * soluong',
  PRIMARY KEY (`id`),
  KEY `idx_ctdh_donhang` (`donhang_id`),
  KEY `idx_ctdh_sanpham` (`sanpham_id`),
  KEY `fk_ctdh_bienthe` (`bienthe_id`),
  CONSTRAINT `fk_ctdh_bienthe` FOREIGN KEY (`bienthe_id`) REFERENCES `bienthesp` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ctdh_donhang` FOREIGN KEY (`donhang_id`) REFERENCES `donhang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctdh_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết đơn hàng';

-- Dumping data for table btapweb.chitietdonhang: ~16 rows (approximately)
INSERT INTO `chitietdonhang` (`id`, `donhang_id`, `sanpham_id`, `bienthe_id`, `tensanpham`, `kichthuoc`, `mausac`, `dongia`, `soluong`) VALUES
	(1, 1, 1, 1, 'Áo Thun Nam Basic', 'M', 'Đen', 149000.00, 1),
	(2, 1, 5, 13, 'Dây Nịt Nam Da Thật', 'Free Size', 'Nâu', 199000.00, 1),
	(3, 2, 2, 5, 'Áo Sơ Mi Trắng Công Sở', 'L', 'Trắng', 299000.00, 1),
	(4, 3, 1, 1, 'Áo Thun Nam Basic', 'M', 'Đen', 149000.00, 1),
	(5, 4, 1, 1, 'Áo Thun Nam Basic', 'M', 'Đen', 149000.00, 15),
	(6, 5, 1, 1, 'Áo Thun Nam Basic', 'M', 'Đen', 149000.00, 1),
	(7, 5, 5, 14, 'Dây Nịt Nam Da Thật', 'Free Size', 'Đen', 199000.00, 8),
	(8, 6, 4, 11, 'Quần Kaki Dài Nam', '30', 'Xám', 320000.00, 1),
	(9, 6, 1, 1, 'Áo Thun Nam Basic', 'M', 'Đen', 149000.00, 1),
	(10, 6, 5, 13, 'Dây Nịt Nam Da Thật', 'Free Size', 'Nâu', 199000.00, 1),
	(11, 7, 2, 4, 'Áo Sơ Mi Trắng Công Sở', 'M', 'Trắng', 299000.00, 1),
	(12, 8, 2, 4, 'Áo Sơ Mi Trắng Công Sở', 'M', 'Trắng', 299000.00, 1),
	(13, 9, 2, 4, 'Áo Sơ Mi Trắng Công Sở', 'M', 'Trắng', 299000.00, 2),
	(14, 10, 2, 4, 'Áo Sơ Mi Trắng Công Sở', 'M', 'Trắng', 299000.00, 1),
	(15, 11, 1, 2, 'Áo Thun Nam Basic', 'L', 'Đen', 149000.00, 2),
	(16, 11, 2, 4, 'Áo Sơ Mi Trắng Công Sở', 'M', 'Trắng', 299000.00, 1);

-- Dumping structure for table btapweb.chitietphieunhap
CREATE TABLE IF NOT EXISTS `chitietphieunhap` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phieunhap_id` int NOT NULL,
  `bienthe_id` int NOT NULL,
  `soluong` int NOT NULL DEFAULT '1',
  `dongia` bigint NOT NULL COMMENT 'Giá nhập mỗi đơn vị',
  `thanhtien` bigint GENERATED ALWAYS AS ((`soluong` * `dongia`)) STORED,
  `ghichu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ctpn_phieunhap` (`phieunhap_id`),
  KEY `idx_ctpn_bienthe` (`bienthe_id`),
  CONSTRAINT `fk_ctpn_bienthe` FOREIGN KEY (`bienthe_id`) REFERENCES `bienthesp` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpn_phieunhap` FOREIGN KEY (`phieunhap_id`) REFERENCES `phieunhap` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết phiếu nhập kho';

-- Dumping data for table btapweb.chitietphieunhap: ~2 rows (approximately)
INSERT INTO `chitietphieunhap` (`id`, `phieunhap_id`, `bienthe_id`, `soluong`, `dongia`, `ghichu`) VALUES
	(1, 1, 13, 2, 13000, 'Dây nịt Nâu - Free Size'),
	(2, 2, 3, 2, 3000, 'Áo Thun Basic XL Trắng');

-- Dumping structure for table btapweb.danhgia
CREATE TABLE IF NOT EXISTS `danhgia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sanpham_id` int NOT NULL,
  `user_id` int NOT NULL,
  `sao` tinyint NOT NULL DEFAULT '5' COMMENT 'Số sao (1-5)',
  `tieude` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tiêu đề đánh giá',
  `noidung` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung đánh giá',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_danhgia` (`user_id`,`sanpham_id`) COMMENT 'Mỗi user chỉ đánh giá 1 lần/SP',
  KEY `idx_danhgia_sanpham` (`sanpham_id`),
  CONSTRAINT `fk_danhgia_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_danhgia_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_sao` CHECK ((`sao` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đánh giá sản phẩm';

-- Dumping data for table btapweb.danhgia: ~2 rows (approximately)
INSERT INTO `danhgia` (`id`, `sanpham_id`, `user_id`, `sao`, `tieude`, `noidung`, `createdAt`) VALUES
	(1, 1, 2, 5, 'Áo đẹp, chất vải tốt', 'Mặc vào rất thoáng mát, đúng size, giao hàng nhanh.', '2026-01-10 02:00:00'),
	(2, 2, 3, 4, 'Sơ mi đẹp, hơi đắt', 'Chất liệu ổn, kiểu dáng thanh lịch. Giá hơi cao.', '2026-01-15 07:30:00');

-- Dumping structure for table btapweb.danhmuc
CREATE TABLE IF NOT EXISTS `danhmuc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tendanhmuc` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên danh mục',
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Slug URL (duy nhất)',
  `mota` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mô tả ngắn',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_danhmuc_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục sản phẩm';

-- Dumping data for table btapweb.danhmuc: ~4 rows (approximately)
INSERT INTO `danhmuc` (`id`, `tendanhmuc`, `slug`, `mota`, `createdAt`) VALUES
	(1, 'Áo Nam', 'ao-nam', 'Các sản phẩm áo dành cho nam giới', '2026-03-11 17:37:05'),
	(2, 'Quần Nam', 'quan-nam', 'Các sản phẩm quần dành cho nam giới', '2026-03-11 17:37:05'),
	(3, 'Phụ Kiện', 'phu-kien', 'Phụ kiện thời trang', '2026-03-11 17:37:05'),
	(4, 'Áo Đông', 'ao-dong', 'Áo ấm mùa đông', '2026-03-11 17:37:05');

-- Dumping structure for table btapweb.diachigiaohang
CREATE TABLE IF NOT EXISTS `diachigiaohang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'Thuộc người dùng nào',
  `tennguoinhan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên người nhận hàng',
  `sodienthoai` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SĐT người nhận',
  `diachichitiet` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Số nhà, tên đường...',
  `phuong` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Phường/Xã',
  `quan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Quận/Huyện',
  `tinh` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tỉnh/Thành phố',
  `macdinh` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = địa chỉ mặc định',
  PRIMARY KEY (`id`),
  KEY `idx_diachi_user` (`user_id`),
  CONSTRAINT `fk_diachi_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Địa chỉ giao hàng';

-- Dumping data for table btapweb.diachigiaohang: ~4 rows (approximately)
INSERT INTO `diachigiaohang` (`id`, `user_id`, `tennguoinhan`, `sodienthoai`, `diachichitiet`, `phuong`, `quan`, `tinh`, `macdinh`) VALUES
	(1, 2, 'Đặng Thành Tâm', '0389907639', 'Xóm 8, Thôn Nhân Thắng', 'Giao Nhân', 'Giao Thủy', 'Nam Định', 1),
	(2, 3, 'Tâm Thành Đặng', '0389907639', 'Số 19, Đường Trần Phú', 'Phường 1', 'TP. Ninh Bình', 'Ninh Bình', 1),
	(3, 3, 'Tâm Thành Đặng', '0389907639', 'Xóm Giao Nhân', 'Giao Hưng', 'Giao Thủy', 'Nam Định', 0);

-- Dumping structure for table btapweb.donhang
CREATE TABLE IF NOT EXISTS `donhang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `diachi_id` int DEFAULT NULL COMMENT 'Địa chỉ giao hàng (NULL nếu lỡ xóa)',
  `ghichu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ghi chú của khách',
  `lydo_huy` text COLLATE utf8mb4_unicode_ci COMMENT 'Lý do hủy đơn',
  `trangthai` enum('choxacnhan','daxacnhan','dangxuly','danggiao','dagiao','dahuy') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'choxacnhan',
  `phuongthuc_thanhtoan` enum('tienmat','chuyenkhoan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tienmat',
  `trangthai_thanhtoan` enum('chuathanhtoan','dathanhtoan','hoantien') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chuathanhtoan',
  `tongtienhang` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Tổng tiền hàng (chưa ship)',
  `phivanchuyen` decimal(15,2) NOT NULL DEFAULT '30000.00' COMMENT 'Phí vận chuyển',
  `tongthanhtoan` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Tổng = hàng + ship',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_donhang_user` (`user_id`),
  KEY `idx_donhang_trangthai` (`trangthai`),
  KEY `fk_donhang_diachi` (`diachi_id`),
  CONSTRAINT `fk_donhang_diachi` FOREIGN KEY (`diachi_id`) REFERENCES `diachigiaohang` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_donhang_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đơn hàng';

-- Dumping data for table btapweb.donhang: ~11 rows (approximately)
INSERT INTO `donhang` (`id`, `user_id`, `diachi_id`, `ghichu`, `lydo_huy`, `trangthai`, `phuongthuc_thanhtoan`, `trangthai_thanhtoan`, `tongtienhang`, `phivanchuyen`, `tongthanhtoan`, `createdAt`, `updatedAt`) VALUES
	(1, 2, 1, NULL, NULL, 'dagiao', 'tienmat', 'dathanhtoan', 619000.00, 30000.00, 649000.00, '2026-01-07 22:09:16', '2026-03-11 17:37:06'),
	(2, 2, 1, NULL, NULL, 'daxacnhan', 'chuyenkhoan', 'chuathanhtoan', 299000.00, 30000.00, 329000.00, '2026-01-07 22:10:14', '2026-03-11 17:37:06'),
	(3, 2, 1, NULL, NULL, 'dangxuly', 'chuyenkhoan', 'chuathanhtoan', 149000.00, 30000.00, 179000.00, '2026-01-08 03:20:48', '2026-03-11 17:37:06'),
	(4, 2, 1, NULL, 'Thay đổi ý định mua hàng', 'dahuy', 'tienmat', 'chuathanhtoan', 2235000.00, 30000.00, 2265000.00, '2026-01-08 08:27:46', '2026-03-11 17:37:06'),
	(5, 3, 2, NULL, 'Thay đổi ý định mua hàng', 'dahuy', 'tienmat', 'chuathanhtoan', 1741000.00, 30000.00, 1771000.00, '2026-01-14 09:39:11', '2026-03-11 17:37:06'),
	(6, 2, 1, NULL, NULL, 'choxacnhan', 'tienmat', 'chuathanhtoan', 668000.00, 30000.00, 698000.00, '2026-01-16 01:16:35', '2026-03-11 17:37:06'),
	(7, 3, 2, NULL, 'Thay đổi ý định mua hàng', 'dahuy', 'tienmat', 'chuathanhtoan', 299000.00, 30000.00, 329000.00, '2026-01-16 03:30:27', '2026-03-11 17:37:06'),
	(8, 3, 2, NULL, NULL, 'choxacnhan', 'tienmat', 'chuathanhtoan', 299000.00, 30000.00, 329000.00, '2026-01-16 03:38:33', '2026-03-11 17:37:06'),
	(9, 3, 2, NULL, NULL, 'choxacnhan', 'tienmat', 'chuathanhtoan', 598000.00, 30000.00, 628000.00, '2026-01-16 06:02:39', '2026-03-11 17:37:06'),
	(10, 3, 3, NULL, NULL, 'choxacnhan', 'tienmat', 'chuathanhtoan', 299000.00, 30000.00, 329000.00, '2026-01-16 14:58:05', '2026-03-11 17:37:06'),
	(11, 3, 2, NULL, NULL, 'danggiao', 'tienmat', 'chuathanhtoan', 597000.00, 30000.00, 627000.00, '2026-01-16 17:11:11', '2026-03-11 17:37:06');

-- Dumping structure for table btapweb.giohang
CREATE TABLE IF NOT EXISTS `giohang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sanpham_id` int NOT NULL,
  `bienthe_id` int DEFAULT NULL,
  `soluong` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_giohang` (`user_id`,`sanpham_id`,`bienthe_id`) COMMENT 'Tránh trùng lặp dòng trong giỏ',
  KEY `idx_giohang_user` (`user_id`),
  KEY `fk_giohang_sanpham` (`sanpham_id`),
  KEY `fk_giohang_bienthe` (`bienthe_id`),
  CONSTRAINT `fk_giohang_bienthe` FOREIGN KEY (`bienthe_id`) REFERENCES `bienthesp` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_giohang_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_giohang_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Giỏ hàng';

-- Dumping data for table btapweb.giohang: ~0 rows (approximately)

-- Dumping structure for table btapweb.phieunhap
CREATE TABLE IF NOT EXISTS `phieunhap` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nguoitao_id` int DEFAULT NULL COMMENT 'Admin tạo phiếu nhập',
  `tongtien` bigint NOT NULL DEFAULT '0' COMMENT 'Tổng tiền nhập (tính từ chitietphieunhap)',
  `ghichu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_phieunhap_user` (`nguoitao_id`),
  CONSTRAINT `fk_phieunhap_user` FOREIGN KEY (`nguoitao_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu nhập kho';

-- Dumping data for table btapweb.phieunhap: ~2 rows (approximately)
INSERT INTO `phieunhap` (`id`, `nguoitao_id`, `tongtien`, `ghichu`, `createdAt`) VALUES
	(1, 1, 26000, 'Nhập bổ sung dây nịt Nâu', '2026-01-14 03:44:14'),
	(2, 1, 6000, 'Nhập bổ sung áo thun XL', '2026-01-17 00:49:07');

-- Dumping structure for table btapweb.sanpham
CREATE TABLE IF NOT EXISTS `sanpham` (
  `id` int NOT NULL AUTO_INCREMENT,
  `danhmuc_id` int NOT NULL COMMENT 'Thuộc danh mục nào',
  `tensanpham` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên sản phẩm',
  `slug` varchar(280) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Slug URL (duy nhất)',
  `mota` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả chi tiết',
  `giaban` decimal(15,2) NOT NULL COMMENT 'Giá bán gốc',
  `giakhuyenmai` decimal(15,2) DEFAULT NULL COMMENT 'Giá sau khuyến mãi (NULL = không KM)',
  `hinhanh` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ảnh đại diện sản phẩm',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sanpham_slug` (`slug`),
  KEY `idx_danhmuc` (`danhmuc_id`),
  CONSTRAINT `fk_sanpham_danhmuc` FOREIGN KEY (`danhmuc_id`) REFERENCES `danhmuc` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sản phẩm';

-- Dumping data for table btapweb.sanpham: ~6 rows (approximately)
INSERT INTO `sanpham` (`id`, `danhmuc_id`, `tensanpham`, `slug`, `mota`, `giaban`, `giakhuyenmai`, `hinhanh`, `createdAt`, `updatedAt`) VALUES
	(1, 1, 'Áo Thun Nam Basic', 'ao-thun-nam-basic', 'Áo thun nam cotton 100% form rộng thoải mái', 199000.00, 149000.00, 'aothunnam.jpg', '2026-03-11 17:37:05', '2026-03-11 17:37:05'),
	(2, 1, 'Áo Sơ Mi Trắng Công Sở', 'ao-so-mi-trang-cong-so', 'Áo sơ mi trắng dài tay phong cách công sở lịch sự', 350000.00, 299000.00, 'ao_so_mi_trang_tay_dai.jpg', '2026-03-11 17:37:05', '2026-03-11 17:37:05'),
	(3, 2, 'Quần Jean Nam Slim Fit', 'quan-jean-nam-slim-fit', 'Quần jean nam dáng ôm vừa phải, chất liệu jean cao cấp', 450000.00, 399000.00, 'quan_jean_nam.png', '2026-03-11 17:37:05', '2026-03-11 17:37:05'),
	(4, 2, 'Quần Kaki Dài Nam', 'quan-kaki-dai-nam', 'Quần kaki dài form straight phù hợp đi làm và dạo phố', 320000.00, NULL, 'quan_haki.jpg', '2026-03-11 17:37:05', '2026-03-11 17:37:05'),
	(5, 3, 'Dây Nịt Nam Da Thật', 'day-nit-nam-da-that', 'Dây nịt nam da bò thật 100% khóa inox cao cấp', 250000.00, 199000.00, 'day_that_lung.webp', '2026-03-11 17:37:05', '2026-03-11 17:37:05'),
	(6, 1, 'Áo Sơ Mi Nam Công Sở', 'ao-so-mi-nam-cong-so', 'Áo sơ mi nam phong cách công sở', 350000.00, 299000.00, 'ao_so_mi_trang_tay_dai.jpg', '2026-03-11 17:37:05', '2026-03-11 17:37:05');

-- Dumping structure for table btapweb.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Khóa chính',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên đăng nhập (duy nhất)',
  `password` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mật khẩu đã hash (bcrypt)',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email (duy nhất)',
  `fullname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Họ tên đầy đủ',
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Số điện thoại',
  `sex` enum('Nam','Nữ') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Giới tính',
  `ngaysinh` date DEFAULT NULL COMMENT 'Ngày sinh',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên file ảnh đại diện',
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT 'Vai trò',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT 'Trạng thái tài khoản',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo tài khoản',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_username` (`username`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tài khoản người dùng';

-- Dumping data for table btapweb.users: ~5 rows (approximately)
INSERT INTO `users` (`id`, `username`, `password`, `email`, `fullname`, `phone`, `sex`, `ngaysinh`, `avatar`, `role`, `status`, `createdAt`, `updatedAt`) VALUES
	(1, 'admin', '$2y$10$3/eu/Ms9Xt/ghZCcBoFRYOYPqxk871ErAnDd1MvPJ.Vc1lsnniTk6', 'admin@btapweb.com', 'Quản trị viên', '0901234567', 'Nam', '1990-01-01', NULL, 'admin', 'active', '2025-11-30 17:00:00', '2026-03-11 17:37:05'),
	(2, 'tamdt13101', '$2y$10$3/eu/Ms9Xt/ghZCcBoFRYOYPqxk871ErAnDd1MvPJ.Vc1lsnniTk6', 'tamdt.a11k48gtb@gmail.com', 'Đặng Thành Tâm', '0389907639', 'Nam', '2005-10-13', 'avatar_2_1768106963.webp', 'admin', 'active', '2025-12-24 08:40:26', '2026-03-23 10:06:32'),
	(3, 'tamdt1310051', '$2y$10$ct9veD40eiVG7zw1D.LLgeRV7r8hM1FcG9cc3l4TimyM41ARRwgCS', 'tamdt13102005@gmail.com', 'Tâm Thành Đặng', '0389907639', 'Nam', '2005-10-13', 'avatar_3_1768500188.webp', 'user', 'active', '2026-01-13 08:03:31', '2026-03-23 10:06:30');

-- Dumping structure for table btapweb.yeuthich
CREATE TABLE IF NOT EXISTS `yeuthich` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sanpham_id` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_yeuthich` (`user_id`,`sanpham_id`) COMMENT 'Tránh thêm trùng yêu thích',
  KEY `idx_yeuthich_sanpham` (`sanpham_id`),
  CONSTRAINT `fk_yeuthich_sanpham` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_yeuthich_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sản phẩm yêu thích';

-- Dumping data for table btapweb.yeuthich: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
