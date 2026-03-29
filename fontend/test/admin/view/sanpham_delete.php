<?php
/**
 * Quản lý sản phẩm - Xóa sản phẩm
 * Xử lý POST request để xóa sản phẩm
 */
require_once __DIR__ . '/../../dao/connect.php';

// Chỉ xử lý POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: sanpham_list.php");
    exit;
}

$id = (int) ($_POST['id'] ?? 0);

if ($id <= 0) {
    header("Location: sanpham_list.php?msg=error&text=" . urlencode("ID sản phẩm không hợp lệ"));
    exit;
}

// Kiểm tra sản phẩm có tồn tại không
$stmt = $conn->prepare("SELECT id, hinhanh FROM sanpham WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$rs = $stmt->get_result();
$sanpham = $rs->fetch_assoc();

if (!$sanpham) {
    header("Location: sanpham_list.php?msg=error&text=" . urlencode("Sản phẩm không tồn tại"));
    exit;
}

// Kiểm tra xem sản phẩm có trong đơn hàng không (tùy chọn - có thể bỏ qua)
// Nếu có ràng buộc khóa ngoại, có thể cần xử lý thêm

// Xóa các biến thể của sản phẩm trước (nếu có)
$stmtBT = $conn->prepare("DELETE FROM bienthesp WHERE sanpham_id = ?");
$stmtBT->bind_param("i", $id);
$stmtBT->execute();

// Xóa sản phẩm
$stmtDel = $conn->prepare("DELETE FROM sanpham WHERE id = ?");
$stmtDel->bind_param("i", $id);

if ($stmtDel->execute()) {
    // Xóa file hình ảnh (tùy chọn)
    // $imagePath = __DIR__ . '/../../public/img/sanpham/' . $sanpham['hinhanh'];
    // if (file_exists($imagePath) && $sanpham['hinhanh'] !== 'placeholder.png') {
    //     unlink($imagePath);
    // }

    header("Location: sanpham_list.php?msg=success&text=" . urlencode("Xóa sản phẩm thành công!"));
} else {
    header("Location: sanpham_list.php?msg=error&text=" . urlencode("Lỗi khi xóa sản phẩm: " . $conn->error));
}
exit;
