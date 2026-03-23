
// Chỉnh lại port Backend nếu bạn đổi sang port khác
const BASE_URL = 'http://localhost:3000/api';

/**
 * Gọi API GET /api/products để lấy danh sách sản phẩm
 * @returns {Array} Mảng các object sản phẩm
 */
async function fetchProducts() {
    try {
        const response = await fetch(`${BASE_URL}/products`);

        // Kiểm tra xem backend có phản hồi ok (status 200) không
        if (!response.ok) {
            throw new Error(`Lỗi HTTP status: ${response.status}`);
        }

        const data = await response.json();

        // Theo chuẩn phản hồi ở Controller của bạn, data thực tế nằm trong trường "data"
        if (data && data.success) {
            return data.data;
        } else {
            console.error("API trả về thất bại:", data.message);
            return [];
        }
    } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
        return [];
    }
}

// ----------------------------------------------------
// (Bạn có thể thêm các hàm fetchLogin, fetchRegister... vào đây về sau)
