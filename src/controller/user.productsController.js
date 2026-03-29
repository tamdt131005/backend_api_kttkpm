import productService from "../services/product.service.js";

class UserProductsController {
    async index(req, res) {
        try {
            const products = await productService.getAllProducts();
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

    async search(req, res) {
        try {
            const q = String(req.query.q || '').trim();
            const limit = Number.parseInt(req.query.limit, 10);
            const products = await productService.searchProducts(q, limit);
            res.status(200).json({
                success: true,
                message: "Tìm kiếm sản phẩm thành công",
                data: products
            });
        } catch (error) {
            console.error("Tìm kiếm sản phẩm có lỗi: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi Server",
                error: error.message
            });
        }
    }

    async productDetail(req, res) {
        try {
            const id = req.params.id;
            const product = await productService.getProductById(id);
            res.status(200).json({
                success: true,
                message: "Lấy thông tin sản phẩm thành công",
                data: product
            });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || "Lỗi Server";
            console.error("Lấy thông tin sản phẩm có lỗi: ", error);
            res.status(status).json({
                success: false,
                message
            });
        }
    }

    async getProductsByCategoryId(req, res) {
        try {
            const categoryId = req.params.category_id;
            const products = await productService.getProductsByCategoryId(categoryId);
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