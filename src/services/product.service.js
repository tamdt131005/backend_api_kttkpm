import userProductsDAO from "../dao/user.productsDao.js";

class ProductService {

    async getAllProducts() {
        const products = await userProductsDAO.getAllProducts();
        return products;
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
