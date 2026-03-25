const img = document.querySelector(".product-image");
const info = document.querySelector(".product-info");

// Lấy id sản phẩm từ URL (vd: ?id=5)
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

// Hiển thị ảnh sản phẩm
function imgProduct(data) {
    img.innerHTML = `<img src="${data.hinhanh}" alt="${data.tensanpham}">`;
}

// Hiển thị thông tin sản phẩm
function infoProduct(data) {
    info.innerHTML = `
        <h2>${data.tensanpham}</h2>
        <p>${data.mota}</p>
        <p>${data.giaban}</p>
    `;
}

// Hàm async chính - bọc await bên trong đây để tránh lỗi SyntaxError
async function init() {
    try {
        const response = await api.get(`/products/${id}`);
        imgProduct(response);
        infoProduct(response);
    } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    }
}

// Gọi hàm init() khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", init);


