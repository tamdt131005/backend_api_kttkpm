import adminDashboardController from "./admin/admin.dashboard.controller.js";
import adminOrderController from "./admin/admin.order.controller.js";
import adminCategoryController from "./admin/admin.category.controller.js";
import adminProductController from "./admin/admin.product.controller.js";
import adminStockController from "./admin/admin.stock.controller.js";
import adminImportController from "./admin/admin.import.controller.js";

const adminController = {
    ...adminDashboardController,
    ...adminOrderController,
    ...adminCategoryController,
    ...adminProductController,
    ...adminStockController,
    ...adminImportController
};

export default adminController;
