import adminDashboardService from "../../services/admin/admin.dashboard.service.js";

const adminDashboardController = {
    async getDashboard(req, res) {
        try {
            const data = await adminDashboardService.layDashboard();
            res.status(200).json({
                success: true,
                message: "Lay dashboard thanh cong",
                data
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                success: false,
                message: error.message || "Loi Server"
            });
        }
    }
};

export default adminDashboardController;
