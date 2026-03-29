<?php
/**
 * Trang đơn hàng - Đã giao (Hoàn thành)
 */
require_once __DIR__ . '/donhang_include.php';

// Xử lý POST
xuLyCapNhatTrangThai('donhang_dagiao.php');

// Lấy dữ liệu
$keyword = $_GET['keyword'] ?? '';
$danhsach = layDanhSachTheoTrangThai('dagiao', $keyword);
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đơn hàng đã giao - Admin</title>
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="admin-container">
    <?php renderHeader('Đơn hàng đã giao', 'dagiao'); ?>
    <?php renderBangDonHang($danhsach, 'dagiao', $keyword); ?>
</div>
</body>
</html>
