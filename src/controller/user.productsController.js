import userProductsDAO from "../dao/user.productsDao.js";

class UserProductsController {
    async index(req, res) {
        try {
            const products = await userProductsDAO.getAllProducts();
            res.status(200).json({
                success: true,
                message: "Lấy danh sách sản phẩm thành công",
                data: products
            });
        } catch (error) {
            console.error("Lấy danh sách sản phẩm có lỗi: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi Server",
                error: error.message
            });
        }
    }
    async detail(req, res) {
        try {
            const id = req.params.id;
            const product = await userProductsDAO.getProductById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm"
                });
            }
            res.status(200).json({
                success: true,
                message: "Lấy thông tin sản phẩm thành công",
                data: product
            });
        } catch (error) {
            console.error("Lấy thông tin sản phẩm có lỗi: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi Server",
                error: error.message
            });
        }
    }
    async getProductsByCategoryId(req, res) {
        try {
            const categoryId = req.params.category_id;
            const products = await userProductsDAO.getProductsByCategoryId(categoryId);
            res.status(200).json({
                success: true,
                message: "Lấy danh sách sản phẩm theo danh mục thành công",
                data: products
            });
        } catch (error) {
            console.error("Lấy danh sách sản phẩm theo danh mục có lỗi: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi Server",
                error: error.message
            });
        }
    }
}

export default new UserProductsController();