/**
 * file: main.js
 * Quản lý logic trên giao diện, bắt sự kiện, thao tác với thư viện Document Object Model (DOM)
 * và gọi dữ liệu từ api.js để in lên màn hình (Hiển thị HTML).
 */

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Lấy phần tử container sẽ chứa sản phẩm trên HTML
    const container = document.getElementById("products-container");
    
    // 2. Gọi API để lấy mảng data sản phẩm (Hàm này được định nghĩa ở api.js)
    const products = await fetchProducts();

    // 3. Nếu không có dữ liệu trả về
    if (!products || products.length === 0) {
        container.innerHTML = "<p>Không có sản phẩm nào để hiển thị hoặc Backend đang tắt!</p>";
        return;
    }

    // 4. Reset nội dung hiện tại (xóa dòng "Đang tải dữ liệu...")
    container.innerHTML = "";

    // 5. Duyệt vòng lặp danh sách sản phẩm để nối chuỗi vào HTML DOM
    products.forEach(product => {
        
        // Lưu ý: Đổi tên biến thuộc tính (product.ten_sp, product.gia_sp, ...) 
        // cho khớp chính xác với Cột trong Database / Data gốc của bạn.
        
        const cardHTML = `
            <div class="product-item">
                <h3>${product.name || product.ten_sanpham || "Tên sản phẩm"}</h3>
                <p><strong>Giá:</strong> ${product.price || product.gia_sanpham || 0} đ</p>
                <p><em>${product.description || product.mota_sp || "Không có mô tả cho sản phẩm này."}</em></p>
                <button onclick="addToCart(${product.id || 1})">Thêm vào giỏ hàng</button>
            </div>
        `;
        
        container.innerHTML += cardHTML;
    });
});

// Hàm demo khi click giỏ hàng
function addToCart(productId) {
    alert(`Bạn đã click mua sản phẩm số ID: ${productId}`);
}
