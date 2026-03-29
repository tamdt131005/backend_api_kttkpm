<?php
/**
 * Trang chi tiết đơn hàng cho Admin
 */
require_once __DIR__ . '/../controller/AdminDonhangController.php';

// Lấy ID đơn hàng
$donhangId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($donhangId <= 0) {
    header('Location: donhang_list.php');
    exit;
}

// Xử lý cập nhật trạng thái
$msg = '';
$msgType = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update_status') {
        $trangthaiMoi = $_POST['trangthai'];
        $ketqua = AdminDonhangController::xetDuyetDonHang($donhangId, $trangthaiMoi);
        $msg = $ketqua['message'];
        $msgType = $ketqua['success'] ? 'success' : 'error';
    }
}

// Lấy chi tiết đơn hàng
$donhang = AdminDonhangController::layChiTietDonHang($donhangId);

if (!$donhang) {
    header('Location: donhang_list.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chi tiết đơn hàng #<?= $donhangId ?> - Admin</title>
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>

<div class="admin-container">
    
    <!-- Header -->
    <div class="page-header">
        <h1>
            <a href="donhang_list.php" style="text-decoration: none; color: inherit;">← </a>
            Chi tiết đơn hàng #<?= $donhangId ?>
        </h1>
        <div class="action-group">
            <span class="badge badge-<?= $donhang['trangthai'] ?>" style="font-size: 14px; padding: 8px 16px;">
                <?= AdminDonhangController::layTenTrangThai($donhang['trangthai']) ?>
            </span>
        </div>
    </div>

    <!-- Thông báo -->
    <?php if ($msg): ?>
    <div class="alert alert-<?= $msgType ?>">
        <span><?= $msgType === 'success' ? '✅' : '❌' ?></span>
        <span><?= htmlspecialchars($msg) ?></span>
    </div>
    <?php endif; ?>

    <!-- Thông tin chính -->
    <div class="order-info-grid">
        <!-- Thông tin khách hàng -->
        <div class="admin-card">
            <div class="info-block">
                <h3>👤 Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> <?= htmlspecialchars($donhang['ten_khachhang'] ?? 'N/A') ?></p>
                <p><strong>SĐT:</strong> <?= $donhang['sdt_khachhang'] ?? 'N/A' ?></p>
                <p><strong>Email:</strong> <?= $donhang['email_khachhang'] ?? 'N/A' ?></p>
            </div>
        </div>

        <!-- Địa chỉ giao hàng -->
        <div class="admin-card">
            <div class="info-block">
                <h3>📍 Địa chỉ giao hàng</h3>
                <p><strong>Người nhận:</strong> <?= htmlspecialchars($donhang['tennguoinhan'] ?? 'N/A') ?></p>
                <p><strong>SĐT:</strong> <?= $donhang['sodienthoai'] ?? 'N/A' ?></p>
                <p><strong>Địa chỉ:</strong> <?= htmlspecialchars($donhang['diachichitiet'] ?? '') ?>, 
                   <?= htmlspecialchars($donhang['phuong'] ?? '') ?>, <?= htmlspecialchars($donhang['tinh'] ?? '') ?></p>
            </div>
        </div>

        <!-- Thông tin đơn hàng -->
        <div class="admin-card">
            <div class="info-block">
                <h3>📋 Thông tin đơn hàng</h3>
                <p><strong>Mã đơn:</strong> #<?= $donhangId ?></p>
                <p><strong>Ngày đặt:</strong> <?= date('d/m/Y H:i', strtotime($donhang['ngaytao'])) ?></p>
                <p><strong>Phương thức TT:</strong> 
                    <?= $donhang['phuongthucthanhtoan'] === 'tienmat' ? '💵 Tiền mặt' : '🏦 Chuyển khoản' ?>
                </p>
                <p><strong>Ghi chú:</strong> <?= $donhang['ghichu'] ?: 'Không có' ?></p>
            </div>
        </div>

        <!-- Xét duyệt -->
        <div class="admin-card">
            <div class="info-block">
                <h3>⚡ Xét duyệt đơn hàng</h3>
                
                <!-- Progress bar -->
                <div class="progress-bar">
                    <?php
                    $danhsachTrangthai = ['choxacnhan', 'daxacnhan', 'dangxuly', 'danggiao', 'dagiao'];
                    $indexHienTai = array_search($donhang['trangthai'], $danhsachTrangthai);
                    foreach ($danhsachTrangthai as $index => $tt):
                        $class = $index < $indexHienTai ? 'completed' : ($index === $indexHienTai ? 'current' : 'pending');
                    ?>
                    <span class="progress-step <?= $class ?>">
                        <?= $index < $indexHienTai ? '✓ ' : '' ?><?= AdminDonhangController::layTenTrangThai($tt) ?>
                    </span>
                    <?php if ($index < count($danhsachTrangthai) - 1): ?>
                    <span class="progress-arrow">→</span>
                    <?php endif; ?>
                    <?php endforeach; ?>
                </div>

                <div style="margin-top: 20px;">
                    <strong>Trạng thái thanh toán:</strong>
                    <span class="badge badge-<?= $donhang['trangthaithanhtoan'] ?>" style="margin-left: 8px;">
                        <?= AdminDonhangController::layTenTrangThaiThanhToan($donhang['trangthaithanhtoan']) ?>
                    </span>
                </div>

                <?php 
                $trangthaiTiepTheo = AdminDonhangController::layTrangThaiTiepTheo($donhang['trangthai']);
                if ($trangthaiTiepTheo): 
                ?>
                <form method="post" style="margin-top: 20px;" 
                      onsubmit="return confirm('Xác nhận chuyển sang trạng thái <?= AdminDonhangController::layTenTrangThai($trangthaiTiepTheo) ?>?')">
                    <input type="hidden" name="action" value="update_status">
                    <input type="hidden" name="donhang_id" value="<?= $donhangId ?>">
                    <input type="hidden" name="trangthai" value="<?= $trangthaiTiepTheo ?>">
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px; background-color: var(--primary); border: none;">
                        ➡️ Chuyển sang "<?= AdminDonhangController::layTenTrangThai($trangthaiTiepTheo) ?>"
                    </button>
                </form>
                <?php else: ?>
                <div style="margin-top: 20px; padding: 16px; background: #d1fae5; border-radius: 8px; text-align: center;">
                    <span style="color: #065f46; font-weight: 600;">✅ Đơn hàng đã hoàn thành</span>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Danh sách sản phẩm -->
    <div class="admin-card">
        <h3 style="margin-bottom: 20px; font-size: 18px;">🛒 Sản phẩm trong đơn hàng</h3>
        
        <?php if (empty($donhang['sanpham'])): ?>
        <p>Không có sản phẩm</p>
        <?php else: ?>
            <?php foreach ($donhang['sanpham'] as $sp): ?>
            <div class="product-item">
                <img src="../../public/img/sanpham/<?= htmlspecialchars($sp['hinhanh']) ?>" 
                     alt="<?= htmlspecialchars($sp['tensanpham']) ?>"
                     onerror="this.src='../../public/img/placeholder.png'">
                <div class="product-info">
                    <h4><?= htmlspecialchars($sp['tensanpham']) ?></h4>
                    <div class="variant">
                        <?php if ($sp['kichthuoc']): ?>Size: <?= $sp['kichthuoc'] ?><?php endif; ?>
                        <?php if ($sp['mausac']): ?> | Màu: <?= $sp['mausac'] ?><?php endif; ?>
                    </div>
                    <div class="variant">Số lượng: <?= $sp['soluong'] ?></div>
                    <div class="price">
                        <?php 
                        $gia = $sp['giakhuyenmai'] ?: $sp['giaban'];
                        echo number_format($gia * $sp['soluong']) . 'đ';
                        ?>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        <?php endif; ?>

        <!-- Tổng kết -->
        <div class="order-summary">
            <div class="summary-row">
                <span>Tiền hàng:</span>
                <span><?= number_format($donhang['tongtienhang']) ?>đ</span>
            </div>
            <div class="summary-row">
                <span>Phí vận chuyển:</span>
                <span><?= number_format($donhang['phivanchuyen']) ?>đ</span>
            </div>
            <div class="summary-row total">
                <span>Tổng thanh toán:</span>
                <span><?= number_format($donhang['tongthanhtoan']) ?>đ</span>
            </div>
        </div>
    </div>
</div>

</body>
</html>
