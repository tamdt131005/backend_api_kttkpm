<?php
/**
 * Quản lý sản phẩm - Danh sách sản phẩm
 * Giao diện theo phong cách admin panel
 */
require_once __DIR__ . '/../../dao/connect.php';

// Tìm kiếm
$keyword = $_GET['keyword'] ?? '';

// Thông báo
$msg = $_GET['msg'] ?? '';
$msgText = $_GET['text'] ?? '';

// Query lấy danh sách sản phẩm
$sql = "
SELECT 
    sp.sanpham_id,
    sp.tensanpham,
    sp.slug,
    sp.giaban,
    sp.giakhuyenmai,
    sp.soluong,
    sp.hinhanh,
    sp.ngaytao,
    dm.tendanhmuc,
    COALESCE(SUM(bt.soluong), sp.soluong, 0) AS tonkho
FROM sanpham sp
LEFT JOIN danhmuc dm ON sp.danhmuc_id = dm.danhmuc_id
LEFT JOIN bienthesp bt ON sp.sanpham_id = bt.sanpham_id
WHERE sp.tensanpham LIKE ?
GROUP BY sp.sanpham_id, sp.tensanpham, sp.slug, sp.giaban, sp.giakhuyenmai, 
         sp.soluong, sp.hinhanh, sp.ngaytao, dm.tendanhmuc
ORDER BY sp.ngaytao DESC
";

$stmt = $conn->prepare($sql);
$keywordParam = "%$keyword%";
$stmt->bind_param("s", $keywordParam);
$stmt->execute();
$rs = $stmt->get_result();

// Thống kê
$sqlStats = "
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN COALESCE(bt_sum.tonkho, sp.soluong, 0) <= 0 THEN 1 ELSE 0 END) as hethang,
    SUM(CASE WHEN COALESCE(bt_sum.tonkho, sp.soluong, 0) > 0 THEN 1 ELSE 0 END) as conhang
FROM sanpham sp
LEFT JOIN (
    SELECT sanpham_id, SUM(soluong) as tonkho FROM bienthesp GROUP BY sanpham_id
) bt_sum ON sp.sanpham_id = bt_sum.sanpham_id
";
$rsStats = $conn->query($sqlStats);
$stats = $rsStats->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý sản phẩm - Admin</title>
    <link rel="stylesheet" href="../css/admin.css">
    <style>
        .product-thumb {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
        }

        .price-old {
            text-decoration: line-through;
            color: var(--gray-400);
            font-size: 13px;
        }

        .price-sale {
            color: var(--danger);
            font-weight: 600;
        }
    </style>
</head>

<body>

    <div class="admin-container">

        <!-- Header -->
        <div class="page-header">
            <h1>👕 Quản lý sản phẩm</h1>
            <div class="action-group">
                <a href="../index.php" class="btn btn-outline">← Trang chủ</a>
                <a href="sanpham_add.php" class="btn btn-primary">➕ Thêm sản phẩm</a>
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
        <div class="stats-cards">
            <div class="stat-card">
                <div class="number">
                    <?= $stats['total'] ?? 0 ?>
                </div>
                <div class="label">Tổng sản phẩm</div>
            </div>
            <div class="stat-card success">
                <div class="number">
                    <?= $stats['conhang'] ?? 0 ?>
                </div>
                <div class="label">Còn hàng</div>
            </div>
            <div class="stat-card danger">
                <div class="number">
                    <?= $stats['hethang'] ?? 0 ?>
                </div>
                <div class="label">Hết hàng</div>
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
            <?php if ($rs->num_rows === 0): ?>
                <div class="empty-state">
                    <h3>Không có sản phẩm nào</h3>
                    <p>Chưa có sản phẩm phù hợp với tiêu chí tìm kiếm</p>
                </div>
            <?php else: ?>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Hình</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $stt = 1;
                        while ($row = $rs->fetch_assoc()):
                            $tonkho = $row['tonkho'];
                            ?>
                            <tr>
                                <td>
                                    <?= $stt++ ?>
                                </td>
                                <td>
                                    <img src="../../public/img/sanpham/<?= htmlspecialchars($row['hinhanh']) ?>"
                                        class="product-thumb" onerror="this.src='../../public/img/placeholder.png'">
                                </td>
                                <td><strong>
                                        <?= htmlspecialchars($row['tensanpham']) ?>
                                    </strong></td>
                                <td>
                                    <?= htmlspecialchars($row['tendanhmuc'] ?? 'Chưa phân loại') ?>
                                </td>
                                <td>
                                    <?php if ($row['giakhuyenmai'] && $row['giakhuyenmai'] < $row['giaban']): ?>
                                        <div class="price-old">
                                            <?= number_format($row['giaban']) ?>đ
                                        </div>
                                        <div class="price-sale">
                                            <?= number_format($row['giakhuyenmai']) ?>đ
                                        </div>
                                    <?php else: ?>
                                        <strong>
                                            <?= number_format($row['giaban']) ?>đ
                                        </strong>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($tonkho <= 0): ?>
                                        <span class="badge badge-daxacnhan">Hết hàng</span>
                                    <?php elseif ($tonkho < 20): ?>
                                        <span class="badge badge-dangxuly">
                                            <?= $tonkho ?> sản phẩm
                                        </span>
                                    <?php else: ?>
                                        <span class="badge badge-danggiao">
                                            <?= $tonkho ?> sản phẩm
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <div class="action-group">
                                        <a href="sanpham_edit.php?id=<?= $row['sanpham_id'] ?>" class="btn btn-sm btn-outline">
                                            ✏️ Sửa
                                        </a>
                                        <form method="post" action="sanpham_delete.php" style="display: inline;"
                                            onsubmit="return confirm('Bạn có chắc muốn xóa sản phẩm này?')">
                                            <input type="hidden" name="id" value="<?= $row['sanpham_id'] ?>">
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