<?php
/**
 * Quản lý nhập hàng - Giao diện tối ưu (không xuất Excel)
 */
require_once __DIR__ . '/../dao/connect.php';

$keyword = $_GET['keyword'] ?? '';

// Thông báo
$msg = $_GET['msg'] ?? '';
$msgText = $_GET['text'] ?? '';

// Query lấy danh sách phiếu nhập - join qua bienthesp
$sql = "
SELECT 
    pn.phieunhap_id,
    pn.ngaynhap,
    pn.ghichu AS ghichu_phieu,
    sp.tensanpham,
    sp.hinhanh,
    bt.kichthuoc,
    bt.mausac,
    ctpn.soluong,
    ctpn.dongia,
    ctpn.thanhtien,
    ctpn.ghichu
FROM phieunhap pn
JOIN chitietphieunhap ctpn ON pn.phieunhap_id = ctpn.phieunhap_id
JOIN bienthesp bt ON ctpn.bienthe_id = bt.bienthe_id
JOIN sanpham sp ON bt.sanpham_id = sp.sanpham_id
WHERE sp.tensanpham LIKE ?
ORDER BY pn.phieunhap_id DESC
";

$stmt = $conn->prepare($sql);
$keywordParam = "%$keyword%";
$stmt->bind_param("s", $keywordParam);
$stmt->execute();
$rs = $stmt->get_result();

// Tính tổng
$tongTien = 0;
$tongSoLuong = 0;
$data = [];
while ($row = $rs->fetch_assoc()) {
    $data[] = $row;
    $tongTien += $row['thanhtien'];
    $tongSoLuong += $row['soluong'];
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý nhập hàng - Admin</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>

<div class="admin-container">
    
    <!-- Header -->
    <div class="page-header">
        <h1>📥 Quản lý nhập hàng</h1>
        <div class="action-group">
            <a href="index.php" class="btn btn-outline">← Trang chủ</a>
            <a href="nhaphang_add.php" class="btn btn-primary">➕ Thêm phiếu nhập</a>
        </div>
    </div>

    <!-- Thông báo -->
    <?php if ($msg): ?>
    <div class="alert alert-<?= $msg ?>">
        <span><?= $msg === 'success' ? '✅' : '❌' ?></span>
        <span><?= htmlspecialchars($msgText) ?></span>
        <button class="close-btn" onclick="this.parentElement.remove()">×</button>
    </div>
    <?php endif; ?>

    <!-- Thống kê -->
    <div class="stats-row">
        <div class="stat-item">
            <div class="label">Tổng phiếu nhập</div>
            <div class="value"><?= count($data) ?></div>
        </div>
        <div class="stat-item">
            <div class="label">Tổng số lượng</div>
            <div class="value"><?= number_format($tongSoLuong) ?></div>
        </div>
        <div class="stat-item">
            <div class="label">Tổng giá trị</div>
            <div class="value danger"><?= number_format($tongTien) ?>đ</div>
        </div>
    </div>

    <div class="admin-card">
        <!-- Form tìm kiếm -->
        <form method="get" class="search-form">
            <input type="text" name="keyword" placeholder="🔍 Tìm theo tên sản phẩm..." 
                   value="<?= htmlspecialchars($keyword) ?>">
            <button type="submit">Tìm kiếm</button>
        </form>

        <!-- Bảng dữ liệu -->
        <?php if (empty($data)): ?>
        <div class="empty-state">
            <h3>Không có phiếu nhập nào</h3>
            <p>Chưa có phiếu nhập phù hợp với tiêu chí tìm kiếm</p>
        </div>
        <?php else: ?>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Mã PN</th>
                    <th>Ngày nhập</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th>Ghi chú</th>
                </tr>
            </thead>
            <tbody>
                <?php $stt = 1; foreach ($data as $row): ?>
                <tr>
                    <td><?= $stt++ ?></td>
                    <td><strong>#<?= $row['phieunhap_id'] ?></strong></td>
                    <td><?= date('d/m/Y', strtotime($row['ngaynhap'])) ?></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="../public/img/<?= htmlspecialchars($row['hinhanh']) ?>" 
                                 class="product-thumb" 
                                 onerror="this.src='../public/img/placeholder.png'">
                            <div>
                                <div><?= htmlspecialchars($row['tensanpham']) ?></div>
                                <small style="color: var(--gray-500);">
                                    <?php if ($row['kichthuoc']): ?>Size: <?= $row['kichthuoc'] ?><?php endif; ?>
                                    <?php if ($row['mausac']): ?> | Màu: <?= $row['mausac'] ?><?php endif; ?>
                                </small>
                            </div>
                        </div>
                    </td>
                    <td><strong><?= number_format($row['soluong']) ?></strong></td>
                    <td><?= number_format($row['dongia']) ?>đ</td>
                    <td><strong style="color: var(--danger);"><?= number_format($row['thanhtien']) ?>đ</strong></td>
                    <td style="color: var(--gray-500); font-size: 13px;"><?= htmlspecialchars($row['ghichu']) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php endif; ?>
    </div>
</div>

</body>
</html>