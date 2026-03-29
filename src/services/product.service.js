import userProductsDAO from "../dao/user.productsDao.js";

class ProductService {

    async getAllProducts() {
        const products = await userProductsDAO.getAllProducts();
        return products;
    }

    async searchProducts(query, limit) {
        const keyword = String(query || '').trim();
        if (!keyword) return [];
        const finalLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 20) : 6;
        return userProductsDAO.searchProducts(keyword, finalLimit);
    }

    async getProductById(id) {
        const product = await userProductsDAO.getProductById(id);
        if (!product) {
            throw { status: 404, message: "Không tìm thấy sản phẩm" };
        }
        return product;
    }


    async getProductsByCategoryId(categoryId) {
        const products = await userProductsDAO.getProductsByCategoryId(categoryId);
        return products;
    }
}

export default new ProductService();
