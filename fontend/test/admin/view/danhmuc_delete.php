<?php
/**
 * Quản lý danh mục - Xóa danh mục
 * Xử lý POST request để xóa danh mục
 */
require_once __DIR__ . '/../../dao/connect.php';

// Chỉ xử lý POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: danhmuc_list.php");
    exit;
}

$id = (int) ($_POST['id'] ?? 0);

if ($id <= 0) {
    header("Location: danhmuc_list.php?msg=error&text=" . urlencode("ID danh mục không hợp lệ"));
    exit;
}

// Kiểm tra danh mục có tồn tại không
$stmt = $conn->prepare("SELECT danhmuc_id FROM danhmuc WHERE danhmuc_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$rs = $stmt->get_result();

if ($rs->num_rows === 0) {
    header("Location: danhmuc_list.php?msg=error&text=" . urlencode("Danh mục không tồn tại"));
    exit;
}

// Cập nhật các sản phẩm thuộc danh mục này về NULL (hoặc có thể set về 0)
$stmtUpdate = $conn->prepare("UPDATE sanpham SET danhmuc_id = NULL WHERE danhmuc_id = ?");
$stmtUpdate->bind_param("i", $id);
$stmtUpdate->execute();

// Xóa danh mục
$stmtDel = $conn->prepare("DELETE FROM danhmuc WHERE danhmuc_id = ?");
$stmtDel->bind_param("i", $id);

if ($stmtDel->execute()) {
    header("Location: danhmuc_list.php?msg=success&text=" . urlencode("Xóa danh mục thành công!"));
} else {
    header("Location: danhmuc_list.php?msg=error&text=" . urlencode("Lỗi khi xóa danh mục: " . $conn->error));
}
exit;
