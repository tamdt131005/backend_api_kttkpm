<?php
/**
 * Trang đơn hàng - Chờ xác nhận
 */
require_once __DIR__ . '/donhang_include.php';

// Xử lý POST
xuLyCapNhatTrangThai('donhang_choxacnhan.php');

// Lấy dữ liệu
$keyword = $_GET['keyword'] ?? '';
$danhsach = layDanhSachTheoTrangThai('choxacnhan', $keyword);
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đơn hàng chờ xác nhận - Admin</title>
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
<div class="admin-container">
    <?php renderHeader('Đơn hàng chờ xác nhận', 'choxacnhan'); ?>
    <?php renderBangDonHang($danhsach, 'choxacnhan', $keyword); ?>
</div>
</body>
</html>
