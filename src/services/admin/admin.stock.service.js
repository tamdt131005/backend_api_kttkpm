import adminStockDAO from "../../dao/admin/admin.stock.dao.js";

class AdminStockService {
    async layTonKho(keyword = "", order = "asc", status = "") {
        const danhsach = await adminStockDAO.layTonKho(keyword, order, status);
        const thongke = await adminStockDAO.layThongKeTonKho();
        return {
            danhsach,
            thongke
        };
    }

    async layDanhSachBienThe(keyword = "") {
        return adminStockDAO.layDanhSachBienThe(keyword);
    }
}

export default new AdminStockService();
