<?php
/**
 * Quản lý danh mục - Thêm danh mục mới
 * Form nhập liệu theo phong cách Shopee admin
 */
require_once __DIR__ . '/../../dao/connect.php';

// Xử lý POST - thêm danh mục
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tendanhmuc = trim($_POST['tendanhmuc'] ?? '');
    $mota = trim($_POST['mota'] ?? '');

    // Tạo slug từ tên danh mục
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $tendanhmuc)));

    // Validate
    if (empty($tendanhmuc)) {
        $error = 'Vui lòng nhập tên danh mục';
    } else {
        // Kiểm tra trùng tên
        $checkStmt = $conn->prepare("SELECT danhmuc_id FROM danhmuc WHERE tendanhmuc = ?");
        $checkStmt->bind_param("s", $tendanhmuc);
        $checkStmt->execute();
        if ($checkStmt->get_result()->num_rows > 0) {
            $error = 'Tên danh mục đã tồn tại';
        } else {
            // Insert vào database
            $sql = "INSERT INTO danhmuc (tendanhmuc, slug, mota) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sss", $tendanhmuc, $slug, $mota);

            if ($stmt->execute()) {
                header("Location: danhmuc_list.php?msg=success&text=" . urlencode("Thêm danh mục thành công!"));
                exit;
            } else {
                $error = 'Lỗi: ' . $conn->error;
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thêm danh mục - Admin</title>
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
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--gray-300);
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.1);
        }

        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid var(--gray-200);
        }
    </style>
</head>

<body>

    <div class="admin-container form-container">

        <!-- Header -->
        <div class="page-header">
            <h1>➕ Thêm danh mục mới</h1>
            <a href="danhmuc_list.php" class="btn btn-outline">← Quay lại</a>
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

        <form method="post">
            <div class="form-card">
                <div class="form-header">
                    📋 Thông tin danh mục
                </div>

                <div class="form-body">
                    <!-- Tên danh mục -->
                    <div class="form-group">
                        <label>Tên danh mục *</label>
                        <input type="text" name="tendanhmuc" required placeholder="Nhập tên danh mục..."
                            value="<?= htmlspecialchars($_POST['tendanhmuc'] ?? '') ?>">
                    </div>

                    <!-- Mô tả -->
                    <div class="form-group">
                        <label>Mô tả</label>
                        <textarea name="mota"
                            placeholder="Nhập mô tả danh mục..."><?= htmlspecialchars($_POST['mota'] ?? '') ?></textarea>
                    </div>

                    <!-- Actions -->
                    <div class="form-actions">
                        <a href="danhmuc_list.php" class="btn btn-outline">Hủy</a>
                        <button type="submit" class="btn-shopee">💾 Lưu danh mục</button>
                    </div>
                </div>
            </div>
        </form>
    </div>

</body>

</html>