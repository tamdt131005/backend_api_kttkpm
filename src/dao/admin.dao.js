import adminOrderDAO from "./admin/admin.order.dao.js";
import adminCategoryDAO from "./admin/admin.category.dao.js";
import adminProductDAO from "./admin/admin.product.dao.js";
import adminStockDAO from "./admin/admin.stock.dao.js";
import adminImportDAO from "./admin/admin.import.dao.js";

const adminDAO = {
    layTatCaDonHang: (...args) => adminOrderDAO.layTatCaDonHang(...args),
    layChiTietDonHang: (...args) => adminOrderDAO.layChiTietDonHang(...args),
    capNhatTrangThaiDonHang: (...args) => adminOrderDAO.capNhatTrangThaiDonHang(...args),
    capNhatTrangThaiThanhToan: (...args) => adminOrderDAO.capNhatTrangThaiThanhToan(...args),
    themLichSuDonHang: (...args) => adminOrderDAO.themLichSuDonHang(...args),
    thongKeDonHang: (...args) => adminOrderDAO.thongKeDonHang(...args),
    layTongDoanhThu: (...args) => adminOrderDAO.layTongDoanhThu(...args),

    layDanhMuc: (...args) => adminCategoryDAO.layDanhMuc(...args),
    layThongKeDanhMuc: (...args) => adminCategoryDAO.layThongKeDanhMuc(...args),
    layDanhMucById: (...args) => adminCategoryDAO.layDanhMucById(...args),
    kiemTraDanhMucTonTai: (...args) => adminCategoryDAO.kiemTraDanhMucTonTai(...args),
    kiemTraTrungTenDanhMuc: (...args) => adminCategoryDAO.kiemTraTrungTenDanhMuc(...args),
    themDanhMuc: (...args) => adminCategoryDAO.themDanhMuc(...args),
    capNhatDanhMuc: (...args) => adminCategoryDAO.capNhatDanhMuc(...args),
    demSanPhamTheoDanhMuc: (...args) => adminCategoryDAO.demSanPhamTheoDanhMuc(...args),
    xoaDanhMuc: (...args) => adminCategoryDAO.xoaDanhMuc(...args),

    laySanPham: (...args) => adminProductDAO.laySanPham(...args),
    layThongKeSanPham: (...args) => adminProductDAO.layThongKeSanPham(...args),
    laySanPhamById: (...args) => adminProductDAO.laySanPhamById(...args),
    themSanPham: (...args) => adminProductDAO.themSanPham(...args),
    capNhatSanPham: (...args) => adminProductDAO.capNhatSanPham(...args),
    xoaSanPham: (...args) => adminProductDAO.xoaSanPham(...args),
    upsertBienTheMacDinh: (...args) => adminProductDAO.upsertBienTheMacDinh(...args),

    layTonKho: (...args) => adminStockDAO.layTonKho(...args),
    layThongKeTonKho: (...args) => adminStockDAO.layThongKeTonKho(...args),
    layDanhSachBienThe: (...args) => adminStockDAO.layDanhSachBienThe(...args),

    layBienTheById: (...args) => adminImportDAO.layBienTheById(...args),
    taoPhieuNhap: (...args) => adminImportDAO.taoPhieuNhap(...args),
    taoChiTietPhieuNhap: (...args) => adminImportDAO.taoChiTietPhieuNhap(...args),
    congTonKhoBienThe: (...args) => adminImportDAO.congTonKhoBienThe(...args),
    layDanhSachPhieuNhap: (...args) => adminImportDAO.layDanhSachPhieuNhap(...args)
};

export default adminDAO;
