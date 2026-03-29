import adminOrderDAO from "../../dao/admin/admin.order.dao.js";
import adminProductDAO from "../../dao/admin/admin.product.dao.js";
import adminCategoryDAO from "../../dao/admin/admin.category.dao.js";
import adminStockDAO from "../../dao/admin/admin.stock.dao.js";

class AdminDashboardService {
    async layDashboard() {
        const thongkeDonHang = await adminOrderDAO.thongKeDonHang();
        const thongkeSanPham = await adminProductDAO.layThongKeSanPham();
        const thongkeDanhMuc = await adminCategoryDAO.layThongKeDanhMuc();
        const thongkeTonKho = await adminStockDAO.layThongKeTonKho();
        const tongDoanhThu = await adminOrderDAO.layTongDoanhThu();

        return {
            donhang: thongkeDonHang,
            sanpham: thongkeSanPham,
            danhmuc: thongkeDanhMuc,
            tonkho: thongkeTonKho,
            tongdoanhthu: tongDoanhThu
        };
    }
}

export default new AdminDashboardService();
