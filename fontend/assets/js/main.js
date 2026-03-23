const container = document.getElementById('products-container');
function renderProductCard(product) {
    // product là 1 object từ DB, ví dụ: { id, ten_sp, gia, hinh_anh, ... }
    return `
        <div class="product-item">
            <img src="${product.hinh_anh || 'assets/images/no-image.png'}" alt="${product.ten_sp}" onerror="this.src='assets/images/no-image.png'">
            <h3>${product.ten_sp}</h3>
            <p class="price">${Number(product.gia).toLocaleString('vi-VN')}đ</p>
            <button onclick="alert('Thêm sản phẩm ID: ${product.id}')">Thêm vào giỏ</button>
        </div>
    `;
}

// =============================================
// BƯỚC 3: Hàm chính - Gọi API và hiển thị sản phẩm
// =============================================
async function loadProducts() {
    // 3.1 Hiện thông báo "Đang tải..."
    container.innerHTML = '<p style="text-align:center; padding:20px;">Đang tải sản phẩm...</p>';

    try {
        // 3.2 Gọi API GET /products (dùng hàm api.get từ api.js đã có sẵn)
        const response = await api.get('/products');

        // 3.3 Lấy mảng sản phẩm từ response
        // API trả về dạng: { success: true, data: [...mảng sản phẩm...] }
        const products = response.data;

        // 3.4 Kiểm tra nếu không có sản phẩm nào
        if (!products || products.length === 0) {
            container.innerHTML = '<p style="text-align:center;">Không có sản phẩm nào.</p>';
            return;
        }

        // 3.5 Tạo HTML cho từng sản phẩm và ghép lại thành 1 chuỗi lớn
        const allProductsHTML = products.map(renderProductCard).join('');

        // 3.6 Đổ HTML vào trong thẻ #products-container
        container.innerHTML = allProductsHTML;

    } catch (error) {
        // 3.7 Nếu có lỗi (mất mạng, server sập...) → hiện thông báo lỗi
        container.innerHTML = `<p style="text-align:center; color:red;">Lỗi tải sản phẩm: ${error.message}</p>`;
        console.error('Chi tiết lỗi:', error);
    }
}

// =============================================
// BƯỚC 4: Chạy hàm loadProducts() khi trang đã tải xong
// =============================================
document.addEventListener('DOMContentLoaded', loadProducts);
