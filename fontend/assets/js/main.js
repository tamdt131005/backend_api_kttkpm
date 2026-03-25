const container = document.getElementById('products-container');

// --- Hàm tạo HTML sao đánh giá (1→5 sao) ---
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="fas fa-star empty"></i>';
        }
    }
    return stars;
}
function formatPrice(price) {
    return Number(price).toLocaleString('vi-VN') + '₫';
}

// --- Hàm tạo HTML card cho 1 sản phẩm ---
function renderProductCard(product) {

    const id = product.id;
    const ten = product.tensanpham || 'Sản phẩm';
    const giaBan = Number(product.giaban || 0);
    const giaKM = Number(product.giakhuyenmai || 0);
    const hinhAnh = product.hinhanh || '';
    const soLuong = Number(product.soluong || product.so_luong || 0);
    const danhGia = Number(product.diem_danh_gia || 0);
    const soDanhGia = Number(product.so_danh_gia || 0);

    const imgSrc = hinhAnh
        ? hinhAnh                                          // nếu là URL đầy đủ
        : 'assets/images/no-image.png';

    const coGiamGia = giaKM > 0 && giaKM < giaBan;
    const phanTramGiam = coGiamGia ? Math.round((1 - giaKM / giaBan) * 100) : 0;
    const giaHienThi = coGiamGia ? giaKM : giaBan;

    return `
        <article class="product-card" data-id="${id}">
            <!-- Link toàn bộ card -->
            <a class="product-link" href="pages/product/detail.html?id=${id}" aria-label="Xem chi tiết ${ten}"></a>

            <!-- Badge giảm giá -->
            ${coGiamGia ? `<span class="product-badge">-${phanTramGiam}%</span>` : ''}

            <!-- Ảnh sản phẩm -->
            <div class="product-image">
                <img src="${imgSrc}" alt="${ten}" loading="lazy"
                     onerror="this.src='assets/images/no-image.png'">
            </div>

            <!-- Thông tin sản phẩm -->
            <div class="product-info">
                <span class="product-category">Thời trang</span>
                <h3 class="product-name">${ten}</h3>

                <!-- Sao đánh giá -->
                <div class="product-rating">
                    <div class="rating-stars">${renderStars(danhGia)}</div>
                    <span class="rating-count">(${soDanhGia})</span>
                </div>

                <!-- Giá -->
                <div class="product-price">
                    <span class="price-sale">${formatPrice(giaHienThi)}</span>
                    ${coGiamGia ? `<span class="price-original">${formatPrice(giaBan)}</span>` : ''}
                </div>

                <!-- Tồn kho -->
                <div class="product-footer" style="margin-top:12px;">
                    ${soLuong > 0
            ? `<span style="color:#10b981;font-weight:600;font-size:0.85rem;">
                                <i class="fas fa-check-circle" style="margin-right:4px;"></i>Còn ${soLuong} sản phẩm
                           </span>`
            : `<span style="color:#ef4444;font-weight:600;font-size:0.85rem;">
                                <i class="fas fa-times-circle" style="margin-right:4px;"></i>Hết hàng
                           </span>`
        }
                </div>
            </div>

            <!-- Nút thêm vào giỏ (nằm ngoài product-info để không bị link che) -->
            <div class="product-actions">
                <button class="btn-add-to-cart" ${soLuong === 0 ? 'disabled' : ''}
                        onclick="event.preventDefault(); addToCart(${id}, '${ten}')">
                    <i class="fas fa-cart-plus"></i>
                    ${soLuong === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
            </div>
        </article>
    `;
}

function addToCart(productId, productName) {
    alert(`Đã thêm "${productName}" vào giỏ hàng! (ID: ${productId})`);
}

async function loadProducts() {
    container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#64748b;">
            <i class="fas fa-spinner fa-spin" style="font-size:2rem; margin-bottom:12px; display:block;"></i>
            Đang tải sản phẩm...
        </div>`;

    try {
        const response = await api.get('/products');
        const products = response.data;

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <i class="fas fa-box-open"></i>
                    <h3>Không có sản phẩm nào</h3>
                    <p>Hệ thống chưa có sản phẩm nào để hiển thị.</p>
                </div>`;
            return;
        }

        container.innerHTML = products.map(renderProductCard).join('');

    } catch (error) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <i class="fas fa-wifi" style="color:#ef4444;"></i>
                <h3>Không thể tải sản phẩm</h3>
                <p>${error.message}</p>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', loadProducts);
