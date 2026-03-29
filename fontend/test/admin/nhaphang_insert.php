<?php
/**
 * Xử lý lưu phiếu nhập hàng
 */
require_once __DIR__ . '/../dao/connect.php';

if (!isset($_POST['bienthe_id'], $_POST['soluong'], $_POST['dongia'])) {
    header("Location: nhaphang_add.php?error=1&msg=" . urlencode("Form gửi thiếu dữ liệu"));
    exit;
}

$conn->begin_transaction();

try {
    $bienthe_id = $_POST['bienthe_id'];
    $soluong = $_POST['soluong'];
    $dongia = $_POST['dongia'];
    $ghichu = $_POST['ghichu'] ?? [];
    $ghichu_phieu = $_POST['ghichu_phieu'] ?? '';

    // Tính tổng tiền
    $tongTien = 0;
    for ($i = 0; $i < count($bienthe_id); $i++) {
        if (!empty($bienthe_id[$i]) && !empty($soluong[$i]) && !empty($dongia[$i])) {
            $tongTien += (int)$soluong[$i] * (int)$dongia[$i];
        }
    }

    // 1️⃣ Tạo phiếu nhập
    $stmtPhieu = $conn->prepare("INSERT INTO phieunhap (tongtien, ghichu) VALUES (?, ?)");
    $stmtPhieu->bind_param("is", $tongTien, $ghichu_phieu);
    $stmtPhieu->execute();
    $phieunhap_id = $conn->insert_id;

    // 2️⃣ Thêm chi tiết phiếu nhập và cập nhật tồn kho
    $stmtChitiet = $conn->prepare("INSERT INTO chitietphieunhap (phieunhap_id, bienthe_id, soluong, dongia, ghichu) VALUES (?, ?, ?, ?, ?)");
    $stmtTonkho = $conn->prepare("UPDATE bienthesp SET soluong = soluong + ? WHERE bienthe_id = ?");

    for ($i = 0; $i < count($bienthe_id); $i++) {
        if (empty($bienthe_id[$i]) || empty($soluong[$i]) || empty($dongia[$i])) {
            continue;
        }

        $bt = (int)$bienthe_id[$i];
        $sl = (int)$soluong[$i];
        $dg = (int)$dongia[$i];
        $gc = $ghichu[$i] ?? '';

        if ($sl <= 0 || $dg <= 0) continue;

        // Kiểm tra biến thể tồn tại
        $rsCheck = $conn->query("SELECT bienthe_id FROM bienthesp WHERE bienthe_id = $bt");
        if ($rsCheck->num_rows == 0) {
            throw new Exception("Biến thể không tồn tại: ID $bt");
        }

        // Thêm chi tiết phiếu nhập
        $stmtChitiet->bind_param("iiiis", $phieunhap_id, $bt, $sl, $dg, $gc);
        $stmtChitiet->execute();

        // Cộng tồn kho
        $stmtTonkho->bind_param("ii", $sl, $bt);
        $stmtTonkho->execute();
    }

    $conn->commit();
    header("Location: nhaphang_list.php?msg=success&text=" . urlencode("Đã lưu phiếu nhập #$phieunhap_id thành công!"));
    exit;

} catch (Exception $e) {
    $conn->rollback();
    header("Location: nhaphang_add.php?error=1&msg=" . urlencode("Lỗi: " . $e->getMessage()));
    exit;
}
