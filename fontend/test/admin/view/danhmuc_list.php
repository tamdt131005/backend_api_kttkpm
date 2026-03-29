<?php
/**
 * Quản lý danh mục - Danh sách danh mục
 * Giao diện theo phong cách admin panel
 */
require_once __DIR__ . '/../../dao/connect.php';

// Tìm kiếm
$keyword = $_GET['keyword'] ?? '';

// Thông báo
$msg = $_GET['msg'] ?? '';
$msgText = $_GET['text'] ?? '';

// Query lấy danh sách danh mục với số lượng sản phẩm
$sql = "
SELECT 
    dm.danhmuc_id,
    dm.tendanhmuc,
    dm.slug,
    dm.mota,
    COUNT(sp.sanpham_id) AS sosanpham
FROM danhmuc dm
LEFT JOIN sanpham sp ON dm.danhmuc_id = sp.danhmuc_id
WHERE dm.tendanhmuc LIKE ?
GROUP BY dm.danhmuc_id, dm.tendanhmuc, dm.slug, dm.mota
ORDER BY dm.tendanhmuc ASC
";

$stmt = $conn->prepare($sql);
$keywordParam = "%$keyword%";
$stmt->bind_param("s", $keywordParam);
$stmt->execute();
$rs = $stmt->get_result();

// Thống kê
$sqlStats = "SELECT COUNT(*) as total FROM danhmuc";
$rsStats = $conn->query($sqlStats);
$stats = $rsStats->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý danh mục - Admin</title>
    <link rel="stylesheet" href="../css/admin.css">
</head>

<body>

    <div class="admin-container">

        <!-- Header -->
        <div class="page-header">
            <h1>📁 Quản lý danh mục</h1>
            <div class="action-group">
                <a href="../index.php" class="btn btn-outline">← Trang chủ</a>
                <a href="danhmuc_add.php" class="btn btn-primary">➕ Thêm danh mục</a>
            </div>
        </div>

        <!-- Thông báo -->
        <?php if ($msg): ?>
            <div class="alert alert-<?= $msg ?>">
                <span>
                    <?= $msg === 'success' ? '✅' : '❌' ?>
                </span>
                <span>
                    <?= htmlspecialchars($msgText) ?>
                </span>
                <button class="close-btn" onclick="this.parentElement.remove()">×</button>
            </div>
        <?php endif; ?>

        <!-- Thống kê -->
        <div class="stats-row">
            <div class="stat-item">
                <div class="label">Tổng danh mục</div>
                <div class="value">
                    <?= $stats['total'] ?? 0 ?>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <!-- Form tìm kiếm -->
            <form method="get" class="search-form">
                <input type="text" name="keyword" placeholder="🔍 Tìm theo tên danh mục..."
                    value="<?= htmlspecialchars($keyword) ?>">
                <button type="submit">Tìm kiếm</button>
            </form>

            <!-- Bảng dữ liệu -->
            <?php if ($rs->num_rows === 0): ?>
                <div class="empty-state">
                    <h3>Không có danh mục nào</h3>
                    <p>Chưa có danh mục phù hợp với tiêu chí tìm kiếm</p>
                </div>
            <?php else: ?>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên danh mục</th>
                            <th>Slug</th>
                            <th>Mô tả</th>
                            <th>Số sản phẩm</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $stt = 1;
                        while ($row = $rs->fetch_assoc()): ?>
                            <tr>
                                <td>
                                    <?= $stt++ ?>
                                </td>
                                <td><strong>
                                        <?= htmlspecialchars($row['tendanhmuc']) ?>
                                    </strong></td>
                                <td><code><?= htmlspecialchars($row['slug'] ?? '') ?></code></td>
                                <td style="color: var(--gray-500); font-size: 13px;">
                                    <?= htmlspecialchars($row['mota'] ?? '-') ?>
                                </td>
                                <td>
                                    <span class="badge badge-danggiao">
                                        <?= $row['sosanpham'] ?> sản phẩm
                                    </span>
                                </td>
                                <td>
                                    <div class="action-group">
                                        <a href="danhmuc_edit.php?id=<?= $row['danhmuc_id'] ?>" class="btn btn-sm btn-outline">
                                            ✏️ Sửa
                                        </a>
                                        <form method="post" action="danhmuc_delete.php" style="display: inline;"
                                            onsubmit="return confirm('Bạn có chắc muốn xóa danh mục này?\nLưu ý: Các sản phẩm thuộc danh mục này sẽ không còn danh mục!')">
                                            <input type="hidden" name="id" value="<?= $row['danhmuc_id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-outline" style="color: var(--danger);">
                                                🗑️ Xóa
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>

</body>

</html>