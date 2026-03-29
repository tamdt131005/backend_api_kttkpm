<?php
/**
 * AdminDonhangController - Controller xử lý nghiệp vụ quản lý đơn hàng admin
 */
require_once __DIR__ . '/../dao/AdminDonhangDAO.php';

class AdminDonhangController
{
    /**
     * Lấy danh sách đơn hàng với filter
     * @param array $filter - Mảng chứa các tiêu chí lọc
     * @return array
     */
    public static function layDanhSachDonHang(array $filter = []): array
    {
        $dao = new AdminDonhangDAO();
        
        $trangthai = $filter['trangthai'] ?? null;
        $keyword = $filter['keyword'] ?? null;
        
        return $dao->layTatCaDonHang($trangthai, $keyword);
    }

    /**
     * Lấy chi tiết đơn hàng
     * @param int $donhangId
     * @return array|null
     */
    public static function layChiTietDonHang(int $donhangId): ?array
    {
        $dao = new AdminDonhangDAO();
        return $dao->layChiTietDonHang($donhangId);
    }

    /**
     * Thứ tự trạng thái đơn hàng (chỉ được chuyển sang trạng thái kế tiếp)
     */
    private static $thuTuTrangThai = [
        'choxacnhan' => 0,
        'daxacnhan' => 1,
        'dangxuly' => 2,
        'danggiao' => 3,
        'dagiao' => 4
    ];

    /**
     * Xét duyệt đơn hàng - cập nhật trạng thái
     * Chỉ cho phép chuyển sang trạng thái kế tiếp, không được quay lại hoặc nhảy cách
     * @param int $donhangId
     * @param string $trangthaiMoi
     * @param string|null $trangthaiHienTai - Trạng thái hiện tại của đơn hàng
     * @return array
     */
    public static function xetDuyetDonHang(int $donhangId, string $trangthaiMoi, ?string $trangthaiHienTai = null): array
    {
        // Kiểm tra trạng thái mới có hợp lệ không
        if (!isset(self::$thuTuTrangThai[$trangthaiMoi])) {
            return [
                'success' => false,
                'message' => 'Trạng thái không hợp lệ'
            ];
        }

        // Nếu không truyền trạng thái hiện tại, lấy từ database
        if ($trangthaiHienTai === null) {
            $dao = new AdminDonhangDAO();
            $donhang = $dao->layChiTietDonHang($donhangId);
            if (!$donhang) {
                return [
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ];
            }
            $trangthaiHienTai = $donhang['trangthai'];
        }

        // Lấy index của trạng thái
        $indexHienTai = self::$thuTuTrangThai[$trangthaiHienTai] ?? -1;
        $indexMoi = self::$thuTuTrangThai[$trangthaiMoi];

        // Kiểm tra: chỉ được chuyển sang trạng thái kế tiếp (index + 1)
        if ($indexMoi !== $indexHienTai + 1) {
            // Nếu trạng thái không đổi
            if ($indexMoi === $indexHienTai) {
                return [
                    'success' => false,
                    'message' => 'Đơn hàng đã ở trạng thái này'
                ];
            }
            // Nếu quay lại trạng thái trước
            if ($indexMoi < $indexHienTai) {
                return [
                    'success' => false,
                    'message' => 'Không thể quay lại trạng thái trước đó'
                ];
            }
            // Nếu nhảy cách trạng thái
            if ($indexMoi > $indexHienTai + 1) {
                $trangthaiTiepTheo = self::layTrangThaiTiepTheo($trangthaiHienTai);
                return [
                    'success' => false,
                    'message' => 'Chỉ có thể chuyển sang "' . self::layTenTrangThai($trangthaiTiepTheo) . '"'
                ];
            }
        }

        // Đã đạt trạng thái cuối cùng
        if ($trangthaiHienTai === 'dagiao') {
            return [
                'success' => false,
                'message' => 'Đơn hàng đã hoàn thành, không thể thay đổi'
            ];
        }

        $dao = new AdminDonhangDAO();
        $ketqua = $dao->capNhatTrangThai($donhangId, $trangthaiMoi);
        
        if ($ketqua) {
            return [
                'success' => true,
                'message' => 'Cập nhật trạng thái thành công'
            ];
        }

        return [
            'success' => false,
            'message' => 'Không thể cập nhật trạng thái'
        ];
    }

    /**
     * Lấy trạng thái tiếp theo có thể chuyển đến
     * @param string $trangthaiHienTai
     * @return string|null
     */
    public static function layTrangThaiTiepTheo(string $trangthaiHienTai): ?string
    {
        $danhsach = array_keys(self::$thuTuTrangThai);
        $indexHienTai = self::$thuTuTrangThai[$trangthaiHienTai] ?? -1;
        
        // Nếu chưa đạt trạng thái cuối cùng
        if ($indexHienTai >= 0 && $indexHienTai < count($danhsach) - 1) {
            return $danhsach[$indexHienTai + 1];
        }
        
        return null; // Đã là trạng thái cuối
    }

    /**
     * Kiểm tra đơn hàng đã hoàn thành chưa
     * @param string $trangthai
     * @return bool
     */
    public static function daHoanThanh(string $trangthai): bool
    {
        return $trangthai === 'dagiao';
    }

    /**
     * Cập nhật trạng thái thanh toán
     * @param int $donhangId
     * @param string $trangthai
     * @return array
     */
    public static function capNhatThanhToan(int $donhangId, string $trangthai): array
    {
        $trangthaiHople = ['chuathanhtoan', 'dathanhtoan', 'hoantien'];
        if (!in_array($trangthai, $trangthaiHople)) {
            return [
                'success' => false,
                'message' => 'Trạng thái thanh toán không hợp lệ'
            ];
        }

        $dao = new AdminDonhangDAO();
        $ketqua = $dao->capNhatTrangThaiThanhToan($donhangId, $trangthai);
        
        if ($ketqua) {
            return [
                'success' => true,
                'message' => 'Cập nhật thanh toán thành công'
            ];
        }

        return [
            'success' => false,
            'message' => 'Không thể cập nhật thanh toán'
        ];
    }

    /**
     * Lấy thống kê đơn hàng
     * @return array
     */
    public static function layThongKe(): array
    {
        $dao = new AdminDonhangDAO();
        return $dao->thongKeDonHang();
    }

    /**
     * Lấy tổng doanh thu
     * @param string|null $tuNgay
     * @param string|null $denNgay
     * @return float
     */
    public static function layTongDoanhThu(?string $tuNgay = null, ?string $denNgay = null): float
    {
        $dao = new AdminDonhangDAO();
        return $dao->layTongDoanhThu($tuNgay, $denNgay);
    }

    /**
     * Chuyển đổi trạng thái thành text hiển thị
     * @param string $trangthai
     * @return string
     */
    public static function layTenTrangThai(string $trangthai): string
    {
        $mapping = [
            'choxacnhan' => 'Chờ xác nhận',
            'daxacnhan' => 'Đã xác nhận',
            'dangxuly' => 'Đang xử lý',
            'danggiao' => 'Đang giao',
            'dagiao' => 'Đã giao'
        ];
        return $mapping[$trangthai] ?? $trangthai;
    }

    /**
     * Chuyển đổi trạng thái thanh toán thành text
     * @param string $trangthai
     * @return string
     */
    public static function layTenTrangThaiThanhToan(string $trangthai): string
    {
        $mapping = [
            'chuathanhtoan' => 'Chưa thanh toán',
            'dathanhtoan' => 'Đã thanh toán',
            'hoantien' => 'Hoàn tiền'
        ];
        return $mapping[$trangthai] ?? $trangthai;
    }

    /**
     * Lấy màu badge cho trạng thái
     * @param string $trangthai
     * @return string
     */
    public static function layMauTrangThai(string $trangthai): string
    {
        $mapping = [
            'choxacnhan' => '#f59e0b',  // Vàng cam
            'daxacnhan' => '#3b82f6',   // Xanh dương
            'dangxuly' => '#8b5cf6',    // Tím
            'danggiao' => '#06b6d4',    // Cyan
            'dagiao' => '#10b981'       // Xanh lá
        ];
        return $mapping[$trangthai] ?? '#6b7280';
    }
}
