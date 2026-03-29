<?php
/**
 * Form thêm phiếu nhập hàng - Giao diện màu Shopee
 */
require_once __DIR__ . '/../dao/connect.php';

// Thông báo lỗi
$error = isset($_GET['error']) ? $_GET['msg'] : '';

// Lấy danh sách biến thể
$rs_bt = $conn->query("
    SELECT 
        bt.bienthe_id,
        CONCAT(sp.tensanpham, ' - Size ', bt.kichthuoc, ' - ', bt.mausac) AS tenbienthe
    FROM bienthesp bt
    JOIN sanpham sp ON bt.sanpham_id = sp.sanpham_id
    ORDER BY sp.tensanpham, bt.kichthuoc, bt.mausac
");
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thêm phiếu nhập hàng - Admin</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>

<div class="admin-container form-container">
    
    <!-- Header -->
    <div class="page-header">
        <h1>📥 Thêm phiếu nhập hàng</h1>
        <a href="nhaphang_list.php" class="btn btn-outline">← Quay lại</a>
    </div>

    <!-- Thông báo lỗi -->
    <?php if ($error): ?>
    <div class="alert alert-error">
        <span>❌</span>
        <span><?= htmlspecialchars($error) ?></span>
    </div>
    <?php endif; ?>

    <form method="post" action="nhaphang_insert.php" id="formNhaphang">
        <div class="form-card">
            <div class="form-header">
                📋 Chi tiết phiếu nhập
            </div>
            
            <div class="form-body">
                <!-- Ghi chú phiếu -->
                <div class="form-group">
                    <label>Ghi chú phiếu nhập (tùy chọn)</label>
                    <textarea name="ghichu_phieu" placeholder="Nhập ghi chú cho phiếu nhập..."></textarea>
                </div>
                
                <!-- Bảng nhập liệu -->
                <table class="input-table" id="bangNhap">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th style="width: 40%;">Biến thể sản phẩm</th>
                            <th style="width: 15%;">Số lượng</th>
                            <th style="width: 15%;">Đơn giá (VNĐ)</th>
                            <th>Ghi chú</th>
                            <th style="width: 60px;">Xóa</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        <!-- Dòng mẫu (ẩn) -->
                        <tr id="dongMau" style="display: none;">
                            <td><span class="row-number">1</span></td>
                            <td>
                                <input list="ds_bienthe" name="tenbienthe[]" placeholder="Gõ tên sản phẩm để tìm...">
                                <input type="hidden" name="bienthe_id[]">
                            </td>
                            <td><input type="number" name="soluong[]" min="1" placeholder="0"></td>
                            <td><input type="number" name="dongia[]" min="1000" step="1000" placeholder="0"></td>
                            <td><input type="text" name="ghichu[]" placeholder="Ghi chú..."></td>
                            <td><button type="button" class="btn-delete" onclick="xoaDong(this)">❌</button></td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Actions -->
                <div class="form-actions">
                    <div class="form-actions-left">
                        <button type="button" class="btn-shopee-outline" onclick="themDong()">
                            ➕ Thêm dòng
                        </button>
                    </div>
                    <button type="submit" class="btn-shopee">
                        💾 Lưu phiếu nhập
                    </button>
                </div>
            </div>
        </div>
    </form>
    
    <!-- Datalist biến thể -->
    <datalist id="ds_bienthe">
        <?php while($bt = $rs_bt->fetch_assoc()): ?>
        <option value="<?= htmlspecialchars($bt['tenbienthe']) ?>" data-id="<?= $bt['bienthe_id'] ?>">
        <?php endwhile; ?>
    </datalist>
</div>

<script>
// Gán sự kiện tìm sản phẩm cho dòng mới
function ganSuKienTimSanPham(row) {
    let input = row.querySelector("input[list]");
    let hidden = row.querySelector("input[type=hidden]");

    input.addEventListener("change", function() {
        hidden.value = "";
        document.querySelectorAll("#ds_bienthe option").forEach(op => {
            if (op.value === this.value) {
                hidden.value = op.dataset.id;
            }
        });
    });
}

// Cập nhật số thứ tự
function capNhatSTT() {
    let rows = document.querySelectorAll("#tableBody tr:not(#dongMau)");
    rows.forEach((row, index) => {
        let stt = row.querySelector(".row-number");
        if (stt) stt.textContent = index + 1;
    });
}

// Thêm dòng mới
function themDong() {
    let tableBody = document.getElementById("tableBody");
    let dongMau = document.getElementById("dongMau");
    let dongMoi = dongMau.cloneNode(true);

    dongMoi.removeAttribute("id");
    dongMoi.style.display = "";
    dongMoi.querySelectorAll("input").forEach(i => i.value = "");

    tableBody.appendChild(dongMoi);
    ganSuKienTimSanPham(dongMoi);
    capNhatSTT();
    
    // Focus vào ô đầu tiên
    dongMoi.querySelector("input[list]").focus();
}

// Xóa dòng
function xoaDong(btn) {
    let row = btn.closest("tr");
    let tableBody = document.getElementById("tableBody");
    let visibleRows = tableBody.querySelectorAll("tr:not(#dongMau)");

    if (visibleRows.length > 1) {
        row.remove();
        capNhatSTT();
    } else {
        alert("Phải có ít nhất 1 sản phẩm!");
    }
}

// Khởi tạo
window.onload = function() {
    themDong();
}
</script>

</body>
</html>
