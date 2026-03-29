<?php
/**
 * File include chung cho tất cả các trang đơn hàng
 * Chứa logic xử lý POST và các hàm dùng chung
 */
require_once __DIR__ . '/../controller/AdminDonhangController.php';

/**
 * Xử lý cập nhật trạng thái đơn hàng (POST)
 */
function xuLyCapNhatTrangThai($redirectPage) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
        if ($_POST['action'] === 'update_status') {
            $donhangId = (int)$_POST['donhang_id'];
            $trangthaiMoi = $_POST['trangthai'];
            $ketqua = AdminDonhangController::xetDuyetDonHang($donhangId, $trangthaiMoi);
            
            // Redirect đến trang tương ứng với trạng thái mới
            $redirectUrl = $redirectPage;
            $redirectUrl .= "?msg=" . ($ketqua['success'] ? 'success' : 'error');
            $redirectUrl .= "&text=" . urlencode($ketqua['message']);
            header("Location: $redirectUrl");
            exit;
        }
    }
}

/**
 * Lấy danh sách đơn hàng theo trạng thái
 */
function layDanhSachTheoTrangThai($trangthai, $keyword = '') {
    $filter = [
        'trangthai' => $trangthai,
        'keyword' => $keyword
    ];
    return AdminDonhangController::layDanhSachDonHang($filter);
}

/**
 * Render header trang đơn hàng
 */
function renderHeader($tieuDe, $trangThaiHienTai) {
    $thongke = AdminDonhangController::layThongKe();
    $msg = $_GET['msg'] ?? '';
    $msgText = $_GET['text'] ?? '';
    $keyword = $_GET['keyword'] ?? '';
    ?>
    <!-- Header -->
    <div class="page-header">
        <h1>📦 <?= $tieuDe ?></h1>
        <a href="../index.php" class="btn btn-outline">← Trang chủ</a>
    </div>

    <!-- Thông báo -->
    <?php if ($msg): ?>
    <div class="alert alert-<?= $msg ?>">
        <span><?= $msg === 'success' ? '✅' : '❌' ?></span>
        <span><?= htmlspecialchars($msgText) ?></span>
        <button class="close-btn" onclick="this.parentElement.remove()">×</button>
    </div>
    <?php endif; ?>

    <!-- Menu điều hướng -->
    <div class="admin-card" style="padding: 16px; margin-bottom: 20px;">
        <div class="status-tabs">
            <a href="donhang_all.php" class="status-tab <?= $trangThaiHienTai === 'all' ? 'active' : '' ?>">
                📋 Tất cả <span class="count"><?= $thongke['tatca'] ?? 0 ?></span>
            </a>
            <a href="donhang_choxacnhan.php" class="status-tab <?= $trangThaiHienTai === 'choxacnhan' ? 'active' : '' ?>">
                ⏳ Chờ xác nhận <span class="count"><?= $thongke['choxacnhan'] ?? 0 ?></span>
            </a>
            <a href="donhang_daxacnhan.php" class="status-tab <?= $trangThaiHienTai === 'daxacnhan' ? 'active' : '' ?>">
                ✔️ Đã xác nhận <span class="count"><?= $thongke['daxacnhan'] ?? 0 ?></span>
            </a>
            <a href="donhang_dangxuly.php" class="status-tab <?= $trangThaiHienTai === 'dangxuly' ? 'active' : '' ?>">
                ⚙️ Đang xử lý <span class="count"><?= $thongke['dangxuly'] ?? 0 ?></span>
            </a>
            <a href="donhang_danggiao.php" class="status-tab <?= $trangThaiHienTai === 'danggiao' ? 'active' : '' ?>">
                🚚 Đang giao <span class="count"><?= $thongke['danggiao'] ?? 0 ?></span>
            </a>
            <a href="donhang_dagiao.php" class="status-tab <?= $trangThaiHienTai === 'dagiao' ? 'active' : '' ?>">
                ✅ Đã giao <span class="count"><?= $thongke['dagiao'] ?? 0 ?></span>
            </a>
        </div>
    </div>
    <?php
}

/**
 * Render bảng đơn hàng với nút xử lý theo trạng thái
 */
function renderBangDonHang($danhsachDonhang, $trangThaiHienTai, $keyword = '') {
    ?>
    <div class="admin-card">
        <!-- Form tìm kiếm -->
        <form method="get" class="search-form">
            <input type="text" name="keyword" placeholder="Tìm theo mã đơn, tên KH, SĐT..." 
                   value="<?= htmlspecialchars($keyword) ?>">
            <button type="submit">🔍 Tìm</button>
        </form>

        <?php if (empty($danhsachDonhang)): ?>
        <div class="empty-state">
            <h3>Không có đơn hàng nào</h3>
            <p>Chưa có đơn hàng ở trạng thái này</p>
        </div>
        <?php else: ?>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Mã ĐH</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Ngày đặt</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($danhsachDonhang as $dh): ?>
                <tr>
                    <td><strong>#<?= $dh['donhang_id'] ?></strong></td>
                    <td>
                        <div><?= htmlspecialchars($dh['ten_khachhang'] ?? 'N/A') ?></div>
                        <small style="color: var(--gray-500);"><?= $dh['sdt_khachhang'] ?></small>
                    </td>
                    <td><strong style="color: var(--danger);"><?= number_format($dh['tongthanhtoan']) ?>đ</strong></td>
                    <td>
                        <span class="badge badge-<?= $dh['trangthaithanhtoan'] ?>">
                            <?= AdminDonhangController::layTenTrangThaiThanhToan($dh['trangthaithanhtoan']) ?>
                        </span>
                    </td>
                    <td><?= date('d/m/Y H:i', strtotime($dh['ngaytao'])) ?></td>
                    <td>
                        <?php renderNutThaoTac($dh, $trangThaiHienTai); ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Render nút thao tác theo trạng thái hiện tại
 */
function renderNutThaoTac($dh, $trangThaiHienTai) {
    $trangthaiTiepTheo = AdminDonhangController::layTrangThaiTiepTheo($dh['trangthai']);
    $trangThaiMoi = $trangthaiTiepTheo ? AdminDonhangController::layTenTrangThai($trangthaiTiepTheo) : '';
    
    // Mapping trạng thái tiếp theo -> file redirect
    $mapRedirect = [
        'daxacnhan' => 'donhang_daxacnhan.php',
        'dangxuly' => 'donhang_dangxuly.php',
        'danggiao' => 'donhang_danggiao.php',
        'dagiao' => 'donhang_dagiao.php'
    ];
    ?>
    <div class="action-group">
        <a href="donhang_detail.php?id=<?= $dh['donhang_id'] ?>" class="btn btn-sm btn-outline">
            👁️ Chi tiết
        </a>
        <?php if ($trangthaiTiepTheo): ?>
        <form method="post" action="<?= $mapRedirect[$trangthaiTiepTheo] ?? '' ?>" style="display: inline;"
              onsubmit="return confirm('Chuyển đơn #<?= $dh['donhang_id'] ?> sang <?= $trangThaiMoi ?>?')">
            <input type="hidden" name="action" value="update_status">
            <input type="hidden" name="donhang_id" value="<?= $dh['donhang_id'] ?>">
            <input type="hidden" name="trangthai" value="<?= $trangthaiTiepTheo ?>">
            <button type="submit" class="btn btn-sm btn-primary">
                ➡️ <?= $trangThaiMoi ?>
            </button>
        </form>
        <?php else: ?>
        <span class="badge badge-dagiao">✅ Hoàn thành</span>
        <?php endif; ?>
    </div>
    <?php
}
