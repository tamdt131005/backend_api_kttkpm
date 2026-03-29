<?php
/**
 * AdminDonhangDAO - DAO quản lý đơn hàng dành cho Admin
 * Tên cột mới: donhang.id, donhang.phuongthuc_thanhtoan, donhang.trangthai_thanhtoan,
 *              donhang.lydo_huy, donhang.createdAt, chitietdonhang.tensanpham/dongia/thanhtien
 */
require_once __DIR__ . '/../../dao/connect.php';

class AdminDonhangDAO
{
    private $conn;

    public function __construct()
    {
        global $conn;
        $this->conn = $conn;
    }

    /**
     * Lấy danh sách đơn hàng (có filter trạng thái + tìm kiếm keyword)
     */
    public function layTatCaDonHang(?string $trangthai = null, ?string $keyword = null): array
    {
        try {
            $sql = "SELECT
                        dh.id AS donhang_id,
                        dh.user_id,
                        dh.ghichu,
                        dh.trangthai,
                        dh.phuongthuc_thanhtoan  AS phuongthucthanhtoan,
                        dh.trangthai_thanhtoan   AS trangthaithanhtoan,
                        dh.tongtienhang,
                        dh.phivanchuyen,
                        dh.tongthanhtoan,
                        dh.createdAt            AS ngaytao,
                        dh.updatedAt            AS ngaycapnhat,
                        u.fullname   AS ten_khachhang,
                        u.phone      AS sdt_khachhang,
                        u.email      AS email_khachhang,
                        dc.tennguoinhan,
                        dc.sodienthoai,
                        dc.diachichitiet,
                        dc.phuong,
                        dc.quan,
                        dc.tinh
                    FROM donhang dh
                    LEFT JOIN users u  ON dh.user_id  = u.id
                    LEFT JOIN diachigiaohang dc ON dh.diachi_id = dc.id
                    WHERE 1=1";

            $params = [];
            $types  = "";

            if ($trangthai !== null && $trangthai !== 'all') {
                $sql     .= " AND dh.trangthai = ?";
                $params[] = $trangthai;
                $types   .= "s";
            }

            if ($keyword !== null && $keyword !== '') {
                $sql     .= " AND (dh.id LIKE ? OR u.fullname LIKE ? OR u.phone LIKE ?)";
                $kw       = "%$keyword%";
                $params[] = $kw; $params[] = $kw; $params[] = $kw;
                $types   .= "sss";
            }

            $sql .= " ORDER BY dh.createdAt DESC";

            $stmt = $this->conn->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        } catch (Exception $e) {
            error_log("AdminDonhangDAO::layTatCaDonHang: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Lấy chi tiết một đơn hàng theo id
     */
    public function layChiTietDonHang(int $donhangId): ?array
    {
        try {
            $sql  = "SELECT
                         dh.id AS donhang_id,
                         dh.*,
                         dh.phuongthuc_thanhtoan  AS phuongthucthanhtoan,
                         dh.trangthai_thanhtoan   AS trangthaithanhtoan,
                         dh.createdAt            AS ngaytao,
                         u.fullname   AS ten_khachhang,
                         u.phone      AS sdt_khachhang,
                         u.email      AS email_khachhang,
                         dc.tennguoinhan,
                         dc.sodienthoai,
                         dc.diachichitiet,
                         dc.phuong,
                         dc.quan,
                         dc.tinh
                     FROM donhang dh
                     LEFT JOIN users u  ON dh.user_id  = u.id
                     LEFT JOIN diachigiaohang dc ON dh.diachi_id = dc.id
                     WHERE dh.id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $donhangId);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows === 0) return null;

            $donhang = $result->fetch_assoc();

            // Lấy sản phẩm trong đơn (dùng thông tin đã lưu lúc mua)
            $sqlCt  = "SELECT
                            ct.id, ct.sanpham_id, ct.bienthe_id,
                            ct.tensanpham, ct.kichthuoc, ct.mausac,
                            ct.dongia, ct.soluong, ct.thanhtien,
                            sp.hinhanh,
                            sp.giaban, sp.giakhuyenmai
                        FROM chitietdonhang ct
                        INNER JOIN sanpham sp ON ct.sanpham_id = sp.id
                        WHERE ct.donhang_id = ?";
            $stmtCt = $this->conn->prepare($sqlCt);
            $stmtCt->bind_param("i", $donhangId);
            $stmtCt->execute();
            $donhang['sanpham'] = $stmtCt->get_result()->fetch_all(MYSQLI_ASSOC);

            return $donhang;
        } catch (Exception $e) {
            error_log("AdminDonhangDAO::layChiTietDonHang: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    public function capNhatTrangThai(int $donhangId, string $trangthai): bool
    {
        try {
            $sql  = "UPDATE donhang SET trangthai = ? WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("si", $trangthai, $donhangId);
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("AdminDonhangDAO::capNhatTrangThai: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cập nhật trạng thái thanh toán
     */
    public function capNhatTrangThaiThanhToan(int $donhangId, string $trangthai): bool
    {
        try {
            $sql  = "UPDATE donhang SET trangthai_thanhtoan = ? WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("si", $trangthai, $donhangId);
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("AdminDonhangDAO::capNhatTrangThaiThanhToan: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Thống kê số đơn hàng theo từng trạng thái
     */
    public function thongKeDonHang(): array
    {
        try {
            $result = $this->conn->query(
                "SELECT trangthai, COUNT(*) AS soluong FROM donhang GROUP BY trangthai"
            );
            $thongke = ['tatca' => 0, 'choxacnhan' => 0, 'daxacnhan' => 0,
                        'dangxuly' => 0, 'danggiao' => 0, 'dagiao' => 0, 'dahuy' => 0];
            while ($row = $result->fetch_assoc()) {
                $thongke[$row['trangthai']] = (int)$row['soluong'];
                $thongke['tatca'] += (int)$row['soluong'];
            }
            return $thongke;
        } catch (Exception $e) {
            error_log("AdminDonhangDAO::thongKeDonHang: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Tính tổng doanh thu (chỉ tính đơn đã giao)
     */
    public function layTongDoanhThu(?string $tuNgay = null, ?string $denNgay = null): float
    {
        try {
            $sql    = "SELECT SUM(tongthanhtoan) AS tongdoanhthu
                       FROM donhang WHERE trangthai = 'dagiao'";
            $params = [];
            $types  = "";
            if ($tuNgay)  { $sql .= " AND DATE(createdAt) >= ?"; $params[] = $tuNgay;  $types .= "s"; }
            if ($denNgay) { $sql .= " AND DATE(createdAt) <= ?"; $params[] = $denNgay; $types .= "s"; }

            $stmt = $this->conn->prepare($sql);
            if (!empty($params)) $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            return (float)($row['tongdoanhthu'] ?? 0);
        } catch (Exception $e) {
            return 0;
        }
    }
}
