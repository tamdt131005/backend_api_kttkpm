<?php
/**
 * Trang đơn hàng - Đang xử lý
 */
require_once __DIR__ . '/donhang_include.php';

// Xử lý POST
xuLyCapNhatTrangThai('donhang_dangxuly.php');

// Lấy dữ liệu
$keyword = $_GET['keyword'] ?? '';
$danhsach = layDanhSachTheoTrangThai('dangxuly', $keyword);
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đơn hàng đang xử lý - Admin</title>
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="admin-container">
    <?php renderHeader('Đơn hàng đang xử lý', 'dangxuly'); ?>
    <?php renderBangDonHang($danhsach, 'dangxuly', $keyword); ?>
</div>
</body>
</html>
