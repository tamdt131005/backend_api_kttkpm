const container = document.getElementById('products-container');

function formatCurrency(value) {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function loadproduct(product) {
    const id = product.id;
    const name = product.tensanpham;
    const giaban = Number(product.giaban) || 0;
    const giakhuyenmai = Number(product.giakhuyenmai) || 0;
    const tong_soluong = Number(product.tong_soluong) || 0;
    const diem_danhgia = Number(product.diem_danhgia) || 0;
    const coGiamGia = giakhuyenmai > 0 && giakhuyenmai < giaban;
    const phanTramGiamGia = coGiamGia ? Math.round((1 - giakhuyenmai / giaban) * 100) : 0;
    const diemLamTron = Math.round(diem_danhgia);
    const duongDanAnh = imageUtil.product(product.hinhanh);

    let priceHtml = '';
    if (coGiamGia) {
        priceHtml = `<span class="price-sale">${formatCurrency(giakhuyenmai)}</span><span class="price-original">${formatCurrency(giaban)}</span>`;
    } else {
        priceHtml = `<span class="price">${formatCurrency(giaban)}</span>`;
    }

    let stockHtml = '';
    if (tong_soluong > 10) {
        stockHtml = `<span style="color: #10b981; font-weight: 600;"><i class="fas fa-check-circle" style="margin-right: 4px;"></i>Còn ${tong_soluong} sản phẩm</span>`;
    } else if (tong_soluong > 0 && tong_soluong <= 10) {
        stockHtml = `<span style="color: #f59e0b; font-weight: 600;"><i class="fas fa-exclamation-circle" style="margin-right: 4px;"></i>Sắp hết hàng</span>`;
    } else {
        stockHtml = `<span style="color: #ef4444; font-weight: 600;"><i class="fas fa-times-circle" style="margin-right: 4px;"></i>Hết hàng</span>`;
    }

    const producthtml = `
        <article class="product-card" data-id="${id}">
            <a class="product-link" href="./pages/product/productdetail.html?id=${id}" aria-label="Xem chi tiết ${name}"></a>
            ${coGiamGia ? `<span class="product-badge">-${phanTramGiamGia}%</span>` : ''}
            <div class="product-image">
                <img src="${duongDanAnh}" alt="${name}" loading="lazy">
            </div>

            <div class="product-info">
                <span class="product-category">Thời trang</span>
                <h3 class="product-name">${name}</h3>
                <div class="product-price">
                    ${priceHtml}
                </div>
                <div class="product-footer" style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div class="product-stock" style="font-size: 0.85rem;">
                        ${stockHtml}
                    </div>
                </div>
            </div>
        </article>
    `;
    if (container) container.insertAdjacentHTML('beforeend', producthtml);
}

async function fill() {
    const res = await api.get('/products');
    if (res.success) {
        const products = res.data;
        products.forEach(product => {
            loadproduct(product);
        });
    }
}
document.addEventListener("DOMContentLoaded", fill);

