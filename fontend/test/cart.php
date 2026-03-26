<?php

require_once __DIR__ . '/../init.php';
require_once __DIR__ . '/../controllers/giohangController.php';


if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$maNguoiDung = (int) $_SESSION['user_id'];
$tenNguoiDung = $_SESSION['username'] ?? 'Khách hàng';

// Lấy dữ liệu giỏ hàng
$danhSachGioHang = giohangController::layDanhSachGioHang($maNguoiDung) ?? [];
$tongTienHang = giohangController::tinhTongTien($maNguoiDung);
$soLuongSP = count($danhSachGioHang);

// Tính phí và tổng
$phiVanChuyen = 30000;
$tongCong = $tongTienHang + $phiVanChuyen;

// Hàm định dạng giá tiền
function dinhDangGia($gia)
{
    return number_format($gia, 0, ',', '.');
}
?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Giỏ Hàng - bTap Shop</title>
    <meta name="description" content="Giỏ hàng của bạn tại bTap Shop">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/btap_web/src/public/css/base.css">
    <link rel="stylesheet" href="/btap_web/src/public/css/header.css">
    <link rel="stylesheet" href="/btap_web/src/public/css/cart.css">
</head>

<body>
    <header>
        <?php require __DIR__ . '/partials/header.php'; ?>
    </header>

    <main>
        <div class="cart-container">
            <h1 class="cart-title">
                <i class="fas fa-shopping-cart"></i> Giỏ Hàng Của Bạn
            </h1>

            <?php if (empty($danhSachGioHang)): ?>
                <!-- Giỏ hàng trống -->
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Giỏ hàng của bạn đang trống</h3>
                    <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
                    <a href="index.php" class="btn-primary">
                        <i class="fas fa-shopping-bag"></i> Mua sắm ngay
                    </a>
                </div>
            <?php else: ?>
                <!-- Có sản phẩm trong giỏ -->
                <div class="cart-content">
                    <!-- Danh sách sản phẩm -->
                    <div class="cart-items-section">
                        <?php foreach ($danhSachGioHang as $sanPham):
                            $maGioHang = $sanPham['giohang_id'] ?? 0;
                            $maSanPham = $sanPham['sanpham_id'] ?? 0;
                            $maBienThe = $sanPham['bienthe_id'] ?? 0;
                            $tenSanPham = $sanPham['tensanpham'] ?? '';
                            $soLuong = (int) ($sanPham['soluong'] ?? 1);
                            $giaBan = (float) ($sanPham['giaban'] ?? 0);
                            $giaKhuyenMai = (float) ($sanPham['giakhuyenmai'] ?? 0);
                            $kichThuoc = $sanPham['kichthuoc'] ?? '';
                            $mauSac = $sanPham['mausac'] ?? '';
                            $soLuongKho = (int) ($sanPham['soluong_kho'] ?? 0);
                            $hinhAnh = $sanPham['hinhanh_bienthe'] ?? $sanPham['hinhanh'] ?? '';

                            $duongDanAnh = $hinhAnh ? '/btap_web/src/public/img/sanpham/' . $hinhAnh : '/btap_web/src/public/img/sanpham/default.png';
                            $coGiamGia = $giaKhuyenMai > 0 && $giaKhuyenMai < $giaBan;
                            $giaHienThi = $coGiamGia ? $giaKhuyenMai : $giaBan;
                            $thanhTien = $giaHienThi * $soLuong;
                            ?>
                            <div class="cart-item">
                                <img src="<?= htmlspecialchars($duongDanAnh) ?>" alt="<?= htmlspecialchars($tenSanPham) ?>"
                                    class="cart-item-image">

                                <div class="cart-item-details">
                                    <a href="product.php?id=<?= $maSanPham ?>" class="cart-item-name">
                                        <?= htmlspecialchars($tenSanPham) ?>
                                    </a>
                                    <?php if ($kichThuoc || $mauSac): ?>
                                        <div class="cart-item-variant">
                                            <?php if ($kichThuoc): ?>
                                                Kích thước: <strong><?= htmlspecialchars($kichThuoc) ?></strong>
                                            <?php endif; ?>
                                            <?php if ($mauSac): ?>
                                                <?= $kichThuoc ? ' | ' : '' ?>Màu sắc: <strong><?= htmlspecialchars($mauSac) ?></strong>
                                            <?php endif; ?>
                                        </div>
                                    <?php endif; ?>
                                    <div class="cart-item-price">
                                        <span class="price-current"><?= dinhDangGia($giaHienThi) ?>₫</span>
                                        <?php if ($coGiamGia): ?>
                                            <span class="price-original"><?= dinhDangGia($giaBan) ?>₫</span>
                                        <?php endif; ?>
                                    </div>
                                    <?php if ($soLuong > $soLuongKho): ?>
                                        <div class="stock-warning">
                                            <i class="fas fa-exclamation-triangle"></i>
                                            Chỉ còn <?= $soluongKho ?> sản phẩm
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <div class="cart-item-actions">
                                    <!-- Form giảm số lượng -->
                                    <div class="quantity-controls">
                                        <form action="/btap_web/src/api/cart/update.php" method="POST" style="display:inline;">
                                            <input type="hidden" name="giohang_id" value="<?= $maGioHang ?>">
                                            <input type="hidden" name="soluong" value="<?= $soLuong - 1 ?>">
                                            <button type="submit" class="quantity-btn btn-decrease" <?= $soLuong <= 1 ? 'disabled' : '' ?>>
                                                <i class="fas fa-minus"></i>
                                            </button>
                                        </form>
                                        <span class="quantity-display"><?= $soLuong ?></span>
                                        <!-- Form tăng số lượng -->
                                        <form action="/btap_web/src/api/cart/update.php" method="POST" style="display:inline;">
                                            <input type="hidden" name="giohang_id" value="<?= $maGioHang ?>">
                                            <input type="hidden" name="soluong" value="<?= $soLuong + 1 ?>">
                                            <button type="submit" class="quantity-btn btn-increase" <?= $soLuong >= $soLuongKho ? 'disabled' : '' ?>>
                                                <i class="fas fa-plus"></i>
                                            </button>
                                        </form>
                                    </div>
                                    <!-- Form xóa sản phẩm -->
                                    <form action="/btap_web/src/api/cart/remove.php" method="POST" style="display:inline;">
                                        <input type="hidden" name="giohang_id" value="<?= $maGioHang ?>">
                                        <button type="submit" class="remove-btn">
                                            <i class="fas fa-trash"></i> Xóa
                                        </button>
                                    </form>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <!-- Tóm tắt đơn hàng -->
                    <div class="cart-summary">
                        <h3>Tóm Tắt Đơn Hàng</h3>

                        <div class="summary-row">
                            <span>Tạm tính (<?= $soLuongSP ?> sản phẩm):</span>
                            <span class="value" id="subtotal"><?= dinhDangGia($tongTienHang) ?>₫</span>
                        </div>

                        <div class="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span class="value"><?= dinhDangGia($phiVanChuyen) ?>₫</span>
                        </div>

                        <div class="summary-row total">
                            <span>Tổng cộng:</span>
                            <span class="value" id="total"><?= dinhDangGia($tongCong) ?>₫</span>
                        </div>

                        <a href="checkout.php" class="checkout-btn">
                            <i class="fas fa-credit-card"></i> Tiến Hành Thanh Toán
                        </a>

                        <a href="index.php" class="continue-shopping">
                            <i class="fas fa-arrow-left"></i> Tiếp tục mua sắm
                        </a>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </main>

    <footer class="site-footer">
        <div class="footer-bottom">
            <p>&copy; 2025 bTap Shop. Developed by <strong>Nhóm 74DCTT21</strong> — Đặng Thành Tâm • Triệu Quang Ninh •
                Bùi Đức Huy • Lê Mạnh Hùng • Nguyễn Hồng Sơn</p>
        </div>
    </footer>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="spinner"></div>
    </div>

    <script src="/btap_web/src/public/js/header.js" defer></script>
    <script src="/btap_web/src/public/js/cart-actions.js" defer></script>
</body>

</html>