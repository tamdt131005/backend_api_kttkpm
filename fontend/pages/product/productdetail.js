const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

const $ = (id) => document.getElementById(id);

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);
}

function renderStars(score) {
    const rounded = Math.round(score);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<i class="fas fa-star${i <= rounded ? '' : ' empty'}"></i>`;
    }
    return html;
}

function renderStock(tong_soluong) {
    const n = Number(tong_soluong) || 0;
    if (n > 10) return `<span class="stock-available"><i class="fas fa-check-circle"></i>Còn ${n} sản phẩm</span>`;
    if (n > 0)  return `<span class="stock-low"><i class="fas fa-exclamation-circle"></i>Sắp hết hàng (còn ${n})</span>`;
    return `<span class="stock-out"><i class="fas fa-times-circle"></i>Hết hàng</span>`;
}

function renderProduct(product) {
    const giaban = Number(product.giaban) || 0;
    const giakm  = Number(product.giakhuyenmai) || 0;
    const coGiam = giakm > 0 && giakm < giaban;
    const phanTram = coGiam ? Math.round((1 - giakm / giaban) * 100) : 0;

    $('product-name').textContent = product.tensanpham;

    $('breadcrumb-product').textContent = product.tensanpham;
    const catLink = $('breadcrumb-category');
    catLink.textContent = product.tendanhmuc || 'Danh mục';
    catLink.href = product.danhmuc_slug ? `/pages/category/index.html?slug=${product.danhmuc_slug}` : '#';

    $('rating-score').textContent = Number(product.diem_danhgia).toFixed(1);
    $('star-icons').innerHTML = renderStars(product.diem_danhgia);
    $('rating-count').textContent = `(${product.luot_danhgia} đánh giá)`;

    if (coGiam) {
        $('price-sale').textContent = formatCurrency(giakm);
        $('price-original').textContent = formatCurrency(giaban);
        $('price-original').style.display = '';
        $('price-discount').textContent = `-${phanTram}%`;
        $('price-discount').style.display = '';
        $('discount-badge').textContent = `-${phanTram}%`;
        $('discount-badge').style.display = '';
    } else {
        $('price-sale').textContent = formatCurrency(giaban);
    }

    const mainImg = $('main-image');
    mainImg.src = imageUtil.product(product.hinhanh);
    mainImg.alt = product.tensanpham;

    const thumbnails = $('thumbnails');
    const allImages = [product.hinhanh, ...(product.hinhanh_phu || [])];
    allImages.forEach((img, idx) => {
        const src = img.startsWith('http') ? img : imageUtil.product(img);
        const div = document.createElement('div');
        div.className = 'thumbnail-item' + (idx === 0 ? ' active' : '');
        div.innerHTML = `<img src="${src}" alt="Ảnh ${idx + 1}">`;
        div.addEventListener('click', () => {
            mainImg.src = src;
            thumbnails.querySelectorAll('.thumbnail-item').forEach(t => t.classList.remove('active'));
            div.classList.add('active');
        });
        thumbnails.appendChild(div);
    });

    const bienthe = product.bienthe || [];
    const mauSet = [...new Set(bienthe.map(b => b.mausac).filter(Boolean))];
    const sizeSet = [...new Set(bienthe.map(b => b.kichthuoc).filter(Boolean))];

    if (mauSet.length > 0) {
        $('group-mausac').style.display = '';
        mauSet.forEach(mau => {
            const opt = document.createElement('option');
            opt.value = mau;
            opt.textContent = mau;
            $('select-mausac').appendChild(opt);
        });
    }

    if (sizeSet.length > 0) {
        $('group-kichthuoc').style.display = '';
        sizeSet.forEach(size => {
            const opt = document.createElement('option');
            opt.value = size;
            opt.textContent = size;
            $('select-kichthuoc').appendChild(opt);
        });
    }

    $('stock-status').innerHTML = renderStock(product.tong_soluong);

    const totalStock = Number(product.tong_soluong) || 0;
    const qtyInput = $('qty-input');
    qtyInput.max = totalStock;
    if (totalStock === 0) {
        qtyInput.disabled = true;
        $('btn-add-cart').disabled = true;
        $('btn-buy-now').disabled = true;
    }

    $('btn-minus').addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
    });
    $('btn-plus').addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 1;
        if (val < totalStock) qtyInput.value = val + 1;
    });

    // === Thêm vào giỏ hàng (gọi API thực) ===
    $('btn-add-cart').addEventListener('click', async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        const qty = parseInt(qtyInput.value) || 1;
        const mau = $('select-mausac')?.value || null;
        const size = $('select-kichthuoc')?.value || null;
        const variant = bienthe.find(b =>
            (!mau || b.mausac === mau) && (!size || String(b.kichthuoc) === String(size))
        );

        try {
            const res = await api.post('/cart', {
                user_id: Number(userId),
                sanpham_id: product.id,
                bienthe_id: variant?.id || null,
                soluong: qty
            });
            if (res.success) {
                alert('Đã thêm vào giỏ hàng!');
            } else {
                alert(res.message || 'Lỗi thêm giỏ hàng');
            }
        } catch (error) {
            console.error('Lỗi thêm giỏ:', error);
            alert('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    });

    // === Mua ngay: thêm giỏ → chuyển checkout ===
    $('btn-buy-now').addEventListener('click', async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('Vui lòng đăng nhập để mua hàng');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        const qty = parseInt(qtyInput.value) || 1;
        const mau = $('select-mausac')?.value || null;
        const size = $('select-kichthuoc')?.value || null;
        const variant = bienthe.find(b =>
            (!mau || b.mausac === mau) && (!size || String(b.kichthuoc) === String(size))
        );

        try {
            const res = await api.post('/cart', {
                user_id: Number(userId),
                sanpham_id: product.id,
                bienthe_id: variant?.id || null,
                soluong: qty
            });
            if (res.success) {
                window.location.href = '/pages/checkout/checkout.html';
            } else {
                alert(res.message || 'Lỗi thêm giỏ hàng');
            }
        } catch (error) {
            console.error('Lỗi mua ngay:', error);
            alert('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    });

    if (product.mota) {
        $('mota-content').innerHTML = product.mota;
        $('product-mota').style.display = '';
    }

    $('loading-state').style.display = 'none';
    $('product-detail').style.display = 'flex';
}

async function init() {
    if (!productId) {
        $('loading-state').style.display = 'none';
        $('error-message').textContent = 'Không tìm thấy ID sản phẩm trong URL.';
        $('error-state').style.display = 'flex';
        return;
    }

    try {
        const res = await api.get(`/products/${productId}`);
        if (!res.success || !res.data) {
            throw { message: res.message || 'Không tìm thấy sản phẩm' };
        }
        renderProduct(res.data);
    } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        $('loading-state').style.display = 'none';
        $('error-message').textContent = error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
        $('error-state').style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', init);
