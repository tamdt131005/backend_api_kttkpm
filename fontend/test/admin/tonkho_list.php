<?php
/**
 * Quản lý tồn kho - Giao diện tối ưu
 */
require_once __DIR__ . '/../dao/connect.php';

// Tìm kiếm
$keyword = $_GET['keyword'] ?? '';

// Sắp xếp
$order = $_GET['order'] ?? 'asc';
if ($order !== 'asc' && $order !== 'desc') {
    $order = 'asc';
}

// Lọc trạng thái
$status = $_GET['status'] ?? '';

$sql = "
SELECT 
    sp.sanpham_id,
    sp.tensanpham,
    sp.hinhanh,
    dm.tendanhmuc,
    COALESCE(SUM(bt.soluong), sp.soluong, 0) AS tonkho
FROM sanpham sp
LEFT JOIN bienthesp bt ON sp.sanpham_id = bt.sanpham_id
LEFT JOIN danhmuc dm ON sp.danhmuc_id = dm.danhmuc_id
WHERE sp.tensanpham LIKE ?
GROUP BY sp.sanpham_id, sp.tensanpham, sp.hinhanh, dm.tendanhmuc, sp.soluong
HAVING 1=1
";

// Lọc theo trạng thái
if ($status === 'hethang') {
    $sql .= " AND tonkho <= 0";
} elseif ($status === 'saphet') {
    $sql .= " AND tonkho > 0 AND tonkho < 20";
} elseif ($status === 'conhang') {
    $sql .= " AND tonkho >= 20";
}

$sql .= " ORDER BY tonkho $order";

$stmt = $conn->prepare($sql);
$keywordParam = "%$keyword%";
$stmt->bind_param("s", $keywordParam);
$stmt->execute();
$rs = $stmt->get_result();

// Thống kê
$sqlStats = "
SELECT 
    SUM(CASE WHEN tonkho <= 0 THEN 1 ELSE 0 END) as hethang,
    SUM(CASE WHEN tonkho > 0 AND tonkho < 20 THEN 1 ELSE 0 END) as saphet,
    SUM(CASE WHEN tonkho >= 20 THEN 1 ELSE 0 END) as conhang,
    COUNT(*) as total
FROM (
    SELECT sp.sanpham_id, COALESCE(SUM(bt.soluong), sp.soluong, 0) AS tonkho
    FROM sanpham sp
    LEFT JOIN bienthesp bt ON sp.sanpham_id = bt.sanpham_id
    GROUP BY sp.sanpham_id, sp.soluong
) AS stats
";
$rsStats = $conn->query($sqlStats);
$stats = $rsStats->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý tồn kho - Admin</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>

<div class="admin-container">
    
    <!-- Header -->
    <div class="page-header">
        <h1>📊 Quản lý tồn kho</h1>
        <div class="action-group">
            <a href="index.php" class="btn btn-outline">← Trang chủ</a>
            <a href="nhaphang_add.php" class="btn btn-primary">➕ Nhập kho</a>
        </div>
    </div>

    <!-- Thống kê -->
    <div class="stats-cards">
        <div class="stat-card">
            <div class="number"><?= $stats['total'] ?? 0 ?></div>
            <div class="label">Tổng sản phẩm</div>
        </div>
        <div class="stat-card success">
            <div class="number"><?= $stats['conhang'] ?? 0 ?></div>
            <div class="label">Còn hàng (≥20)</div>
        </div>
        <div class="stat-card warning">
            <div class="number"><?= $stats['saphet'] ?? 0 ?></div>
            <div class="label">Sắp hết (<20)</div>
        </div>
        <div class="stat-card danger">
            <div class="number"><?= $stats['hethang'] ?? 0 ?></div>
            <div class="label">Hết hàng (0)</div>
        </div>
    </div>

    <div class="admin-card">
        <!-- Form lọc -->
        <form method="get" class="filter-form">
            <input type="text" name="keyword" placeholder="🔍 Tìm sản phẩm..." 
                   value="<?= htmlspecialchars($keyword) ?>" style="flex: 1; max-width: 300px;">
            
            <select name="order">
                <option value="asc" <?= $order === 'asc' ? 'selected' : '' ?>>Tồn kho: Thấp → Cao</option>
                <option value="desc" <?= $order === 'desc' ? 'selected' : '' ?>>Tồn kho: Cao → Thấp</option>
            </select>
            
            <select name="status">
                <option value="">Tất cả trạng thái</option>
                <option value="hethang" <?= $status === 'hethang' ? 'selected' : '' ?>>🔴 Hết hàng</option>
                <option value="saphet" <?= $status === 'saphet' ? 'selected' : '' ?>>🟡 Sắp hết</option>
                <option value="conhang" <?= $status === 'conhang' ? 'selected' : '' ?>>🟢 Còn hàng</option>
            </select>
            
            <button type="submit" class="btn btn-primary">Lọc</button>
        </form>

        <!-- Bảng dữ liệu -->
        <table class="admin-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Hình</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody>
                <?php $stt = 1; while ($row = $rs->fetch_assoc()): 
                    $sl = $row['tonkho'];
                    // Logic màu sắc badge
                    if ($sl <= 0) {
                        $badgeClass = 'badge-choxacnhan'; // Tận dụng style cam/vàng/đỏ của các badge trạng thái
                        if ($sl <= 0) $badgeClass = 'badge-daxacnhan'; // Màu đỏ/cam đậm hơn cho hết hàng
                        $ttText = 'Hết hàng';
                    } elseif ($sl < 20) {
                        $badgeClass = 'badge-dangxuly'; // Xanh dương/tím
                        $ttText = 'Sắp hết';
                    } else {
                        $badgeClass = 'badge-danggiao'; // Xanh cyan
                        $ttText = 'Còn hàng';
                    }
                ?>
                <tr>
                    <td><?= $stt++ ?></td>
                    <td>
                        <img src="../public/img/sanpham/<?= htmlspecialchars($row['hinhanh']) ?>" 
                             class="product-thumb" 
                             onerror="this.src='../public/img/placeholder.png'">
                    </td>
                    <td><strong><?= htmlspecialchars($row['tensanpham']) ?></strong></td>
                    <td><?= htmlspecialchars($row['tendanhmuc']) ?></td>
                    <td><strong><?= $sl ?></strong></td>
                    <td><span class="badge <?= $badgeClass ?>"><?= $ttText ?></span></td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>
</div>

</body>
</html>
