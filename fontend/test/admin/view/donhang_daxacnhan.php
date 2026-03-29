<?php
/**
 * Trang đơn hàng - Đã xác nhận
 */
require_once __DIR__ . '/donhang_include.php';

// Xử lý POST
xuLyCapNhatTrangThai('donhang_daxacnhan.php');

// Lấy dữ liệu
$keyword = $_GET['keyword'] ?? '';
$danhsach = layDanhSachTheoTrangThai('daxacnhan', $keyword);
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đơn hàng đã xác nhận - Admin</title>
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="admin-container">
    <?php renderHeader('Đơn hàng đã xác nhận', 'daxacnhan'); ?>
    <?php renderBangDonHang($danhsach, 'daxacnhan', $keyword); ?>
</div>
</body>
</html>
