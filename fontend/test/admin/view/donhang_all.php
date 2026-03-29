<?php
/**
 * Trang đơn hàng - Tất cả trạng thái
 */
require_once __DIR__ . '/donhang_include.php';

// Xử lý POST
xuLyCapNhatTrangThai('donhang_all.php');

// Lấy dữ liệu
$keyword = $_GET['keyword'] ?? '';
$danhsach = layDanhSachTheoTrangThai('all', $keyword);
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tất cả đơn hàng - Admin</title>
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="admin-container">
    <?php renderHeader('Tất cả đơn hàng', 'all'); ?>
    <?php renderBangDonHang($danhsach, 'all', $keyword); ?>
</div>
</body>
</html>
