<?php
/**
 * Quản lý sản phẩm - Sửa sản phẩm
 * Form chỉnh sửa với dữ liệu prefill
 */
require_once __DIR__ . '/../../dao/connect.php';

// Lấy ID sản phẩm
$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    header("Location: sanpham_list.php?msg=error&text=" . urlencode("Không tìm thấy sản phẩm"));
    exit;
}

// Lấy thông tin sản phẩm
$stmt = $conn->prepare("SELECT * FROM sanpham WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$rs = $stmt->get_result();
$sanpham = $rs->fetch_assoc();

if (!$sanpham) {
    header("Location: sanpham_list.php?msg=error&text=" . urlencode("Sản phẩm không tồn tại"));
    exit;
}

// Lấy danh sách danh mục
$rsDanhmuc = $conn->query("SELECT id AS danhmuc_id, tendanhmuc FROM danhmuc ORDER BY tendanhmuc");

// Xử lý POST - cập nhật sản phẩm
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tensanpham = trim($_POST['tensanpham'] ?? '');
    $danhmuc_id = (int) ($_POST['danhmuc_id'] ?? 0);
    $mota = trim($_POST['mota'] ?? '');
    $giaban = (int) ($_POST['giaban'] ?? 0);
    $giakhuyenmai = (int) ($_POST['giakhuyenmai'] ?? 0);
    $soluong = (int) ($_POST['soluong'] ?? 0);

    // Tạo slug từ tên sản phẩm
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $tensanpham)));

    // Xử lý upload hình ảnh mới (nếu có)
    $hinhanh = $sanpham['hinhanh']; // Giữ hình cũ mặc định
    if (isset($_FILES['hinhanh']) && $_FILES['hinhanh']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../../public/img/sanpham/';
        $fileName = time() . '_' . basename($_FILES['hinhanh']['name']);
        $targetPath = $uploadDir . $fileName;

        // Kiểm tra loại file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (in_array($_FILES['hinhanh']['type'], $allowedTypes)) {
            if (move_uploaded_file($_FILES['hinhanh']['tmp_name'], $targetPath)) {
                $hinhanh = $fileName;
            }
        }
    }

    // Validate
    if (empty($tensanpham)) {
        $error = 'Vui lòng nhập tên sản phẩm';
    } elseif ($giaban <= 0) {
        $error = 'Giá bán phải lớn hơn 0';
    } else {
        // Update database
        $sql = "UPDATE sanpham SET
                    danhmuc_id = ?,
                    tensanpham = ?,
                    slug = ?,
                    mota = ?,
                    giaban = ?,
                    giakhuyenmai = ?,
                    hinhanh = ?
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isssidsi", $danhmuc_id, $tensanpham, $slug, $mota, $giaban, $giakhuyenmai, $hinhanh, $id);

        if ($stmt->execute()) {
            header("Location: sanpham_list.php?msg=success&text=" . urlencode("Cập nhật sản phẩm thành công!"));
            exit;
        } else {
            $error = 'Lỗi: ' . $conn->error;
        }
    }

    // Cập nhật lại $sanpham với dữ liệu mới nhập để hiển thị form
    $sanpham = array_merge($sanpham, [
        'tensanpham' => $tensanpham,
        'danhmuc_id' => $danhmuc_id,
        'mota' => $mota,
        'giaban' => $giaban,
        'giakhuyenmai' => $giakhuyenmai,
        'soluong' => $soluong
    ]);
}
?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sửa sản phẩm - Admin</title>
    <link rel="stylesheet" href="../css/admin.css">
    <style>
        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--gray-700);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--gray-300);
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
        }

        .form-group textarea {
            min-height: 120px;
            resize: vertical;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid var(--gray-200);
        }

        .current-image {
            max-width: 150px;
            border-radius: 8px;
            margin-top: 10px;
        }

        .preview-image {
            max-width: 200px;
            max-height: 200px;
            border-radius: 8px;
            margin-top: 10px;
            display: none;
        }
    </style>
</head>

<body>

    <div class="admin-container form-container">

        <!-- Header -->
        <div class="page-header">
            <h1>✏️ Sửa sản phẩm</h1>
            <a href="sanpham_list.php" class="btn btn-outline">← Quay lại</a>
        </div>

        <!-- Thông báo lỗi -->
        <?php if ($error): ?>
            <div class="alert alert-error">
                <span>❌</span>
                <span>
                    <?= htmlspecialchars($error) ?>
                </span>
                <button class="close-btn" onclick="this.parentElement.remove()">×</button>
            </div>
        <?php endif; ?>

        <form method="post" enctype="multipart/form-data">
            <div class="form-card">
                <div class="form-header">
                    📋 Thông tin sản phẩm #
                    <?= $id ?>
                </div>

                <div class="form-body">
                    <!-- Tên sản phẩm -->
                    <div class="form-group">
                        <label>Tên sản phẩm *</label>
                        <input type="text" name="tensanpham" required placeholder="Nhập tên sản phẩm..."
                            value="<?= htmlspecialchars($sanpham['tensanpham']) ?>">
                    </div>

                    <!-- Danh mục -->
                    <div class="form-group">
                        <label>Danh mục</label>
                        <select name="danhmuc_id">
                            <option value="0">-- Chọn danh mục --</option>
                            <?php
                            // Reset pointer
                            $rsDanhmuc->data_seek(0);
                            while ($dm = $rsDanhmuc->fetch_assoc()):
                                ?>
                                <option value="<?= $dm['danhmuc_id'] ?>" <?= ($sanpham['danhmuc_id'] == $dm['danhmuc_id']) ? 'selected' : '' ?>>
                                    <?= htmlspecialchars($dm['tendanhmuc']) ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>

                    <!-- Giá bán và giá khuyến mãi -->
                    <div class="form-row">
                        <div class="form-group">
                            <label>Giá bán (VNĐ) *</label>
                            <input type="number" name="giaban" required min="1000" step="1000" placeholder="0"
                                value="<?= $sanpham['giaban'] ?>">
                        </div>
                        <div class="form-group">
                            <label>Giá khuyến mãi (VNĐ)</label>
                            <input type="number" name="giakhuyenmai" min="0" step="1000" placeholder="0"
                                value="<?= $sanpham['giakhuyenmai'] ?>">
                        </div>
                    </div>

                    <!-- Số lượng -->
                    <div class="form-group">
                        <label>Số lượng tồn kho</label>
                        <input type="number" name="soluong" min="0" placeholder="0" value="<?= $sanpham['soluong'] ?>">
                    </div>

                    <!-- Mô tả -->
                    <div class="form-group">
                        <label>Mô tả sản phẩm</label>
                        <textarea name="mota"
                            placeholder="Nhập mô tả chi tiết sản phẩm..."><?= htmlspecialchars($sanpham['mota']) ?></textarea>
                    </div>

                    <!-- Hình ảnh hiện tại -->
                    <div class="form-group">
                        <label>Hình ảnh hiện tại</label>
                        <img src="../../public/img/sanpham/<?= htmlspecialchars($sanpham['hinhanh']) ?>"
                            class="current-image" onerror="this.src='../../public/img/placeholder.png'">
                    </div>

                    <!-- Upload hình mới -->
                    <div class="form-group">
                        <label>Thay đổi hình ảnh (để trống nếu giữ nguyên)</label>
                        <input type="file" name="hinhanh" accept="image/*" id="inputHinhanh">
                        <img id="previewImage" class="preview-image" alt="Preview">
                    </div>

                    <!-- Actions -->
                    <div class="form-actions">
                        <a href="sanpham_list.php" class="btn btn-outline">Hủy</a>
                        <button type="submit" class="btn-shopee">💾 Lưu thay đổi</button>
                    </div>
                </div>
            </div>
        </form>
    </div>

    <script>
        // Preview hình ảnh khi chọn file
        document.getElementById('inputHinhanh').addEventListener('change', function (e) {
            const preview = document.getElementById('previewImage');
            const file = e.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        });
    </script>

</body>

</html>