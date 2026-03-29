import adminDashboardService from "./admin/admin.dashboard.service.js";
import adminOrderService from "./admin/admin.order.service.js";
import adminCategoryService from "./admin/admin.category.service.js";
import adminProductService from "./admin/admin.product.service.js";
import adminStockService from "./admin/admin.stock.service.js";
import adminImportService from "./admin/admin.import.service.js";

class AdminService {
    layDashboard(...args) {
        return adminDashboardService.layDashboard(...args);
    }

    layDanhSachDonHang(...args) {
        return adminOrderService.layDanhSachDonHang(...args);
    }

    layChiTietDonHang(...args) {
        return adminOrderService.layChiTietDonHang(...args);
    }

    capNhatTrangThaiDonHang(...args) {
        return adminOrderService.capNhatTrangThaiDonHang(...args);
    }

    capNhatTrangThaiThanhToan(...args) {
        return adminOrderService.capNhatTrangThaiThanhToan(...args);
    }

    layDanhMuc(...args) {
        return adminCategoryService.layDanhMuc(...args);
    }

    layDanhMucById(...args) {
        return adminCategoryService.layDanhMucById(...args);
    }

    themDanhMuc(...args) {
        return adminCategoryService.themDanhMuc(...args);
    }

    capNhatDanhMuc(...args) {
        return adminCategoryService.capNhatDanhMuc(...args);
    }

    xoaDanhMuc(...args) {
        return adminCategoryService.xoaDanhMuc(...args);
    }

    laySanPham(...args) {
        return adminProductService.laySanPham(...args);
    }

    laySanPhamById(...args) {
        return adminProductService.laySanPhamById(...args);
    }

    themSanPham(...args) {
        return adminProductService.themSanPham(...args);
    }

    capNhatSanPham(...args) {
        return adminProductService.capNhatSanPham(...args);
    }

    xoaSanPham(...args) {
        return adminProductService.xoaSanPham(...args);
    }

    layTonKho(...args) {
        return adminStockService.layTonKho(...args);
    }

    layDanhSachBienThe(...args) {
        return adminStockService.layDanhSachBienThe(...args);
    }

    layNhapHang(...args) {
        return adminImportService.layNhapHang(...args);
    }

    themPhieuNhap(...args) {
        return adminImportService.themPhieuNhap(...args);
    }
}

export default new AdminService();
