let currentCartItems = [];

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0) + '₫';
}
function getUserId() {
    return localStorage.getItem('user_id');
}

function showLoading() {
    document.getElementById('loadingOverlay')?.classList.add('active');
}
function hideLoading() {
    document.getElementById('loadingOverlay')?.classList.remove('active');
}

//  1 item trong giỏ hàng
function renderCartItem(item) {
    const giaban = Number(item.giaban) || 0;
    const giakm = Number(item.giakhuyenmai) || 0;
    const coGiam = giakm > 0 && giakm < giaban;
    const giaHienThi = coGiam ? giakm : giaban;
    const soluongKho = Number(item.soluong_kho) || 999;

    // Ảnh 
    const hinhanh = item.hinhanh_bienthe || item.hinhanh || '';
    const imgSrc = imageUtil.product(hinhanh);

    //  biến thể
    let variantHtml = '';
    if (item.kichthuoc || item.mausac) {
        variantHtml = '<div class="cart-item-variant">';
        if (item.kichthuoc) variantHtml += `Kích thước: <strong>${item.kichthuoc}</strong>`;
        if (item.mausac) variantHtml += `${item.kichthuoc ? ' | ' : ''}Màu sắc: <strong>${item.mausac}</strong>`;
        variantHtml += '</div>';
    }

    // Giá
    let priceHtml = `<span class="price-current">${formatCurrency(giaHienThi)}</span>`;
    if (coGiam) {
        priceHtml += `<span class="price-original">${formatCurrency(giaban)}</span>`;
    }

    // tồn kho
    let stockWarning = '';
    if (item.soluong > soluongKho) {
        stockWarning = `<div class="stock-warning"><i class="fas fa-exclamation-triangle"></i> Chỉ còn ${soluongKho} sản phẩm</div>`;
    }

    return `
        <div class="cart-item" data-cart-id="${item.giohang_id}">
            <img src="${imgSrc}" alt="${item.tensanpham}" class="cart-item-image">
            <div class="cart-item-details">
                <a href="/pages/product/productdetail.html?id=${item.sanpham_id}" class="cart-item-name">
                    ${item.tensanpham}
                </a>
                ${variantHtml}
                <div class="cart-item-price">${priceHtml}</div>
                ${stockWarning}
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn btn-decrease" onclick="updateQuantity(${item.giohang_id}, ${item.soluong - 1})" ${item.soluong <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.soluong}</span>
                    <button class="quantity-btn btn-increase" onclick="updateQuantity(${item.giohang_id}, ${item.soluong + 1})" ${item.soluong >= soluongKho ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-btn" onclick="removeItem(${item.giohang_id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        </div>
    `;
}

function renderCart(data) {
    const { items, tongtien } = data;
    currentCartItems = items || [];
    const loadingEl = document.getElementById('cart-loading');
    const emptyEl = document.getElementById('cart-empty');
    const contentEl = document.getElementById('cart-content');

    loadingEl.style.display = 'none';

    if (!items || items.length === 0) {
        emptyEl.style.display = '';
        contentEl.style.display = 'none';
        return;
    }

    emptyEl.style.display = 'none';
    contentEl.style.display = '';
    const itemsHtml = items.map(renderCartItem).join('');
    document.getElementById('cart-items').innerHTML = itemsHtml;

    const phiVanChuyen = 30000;
    const tongCong = Number(tongtien) + phiVanChuyen;

    document.getElementById('item-count').textContent = items.length;
    document.getElementById('subtotal').textContent = formatCurrency(tongtien);
    document.getElementById('total').textContent = formatCurrency(tongCong);
}
async function loadCart() {
    const userId = getUserId();
    if (!userId) {
        document.getElementById('cart-loading').style.display = 'none';
        document.getElementById('cart-not-logged').style.display = '';
        return;
    }

    try {
        const res = await api.get('/cart');
        if (res.success) {
            renderCart(res.data);
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        console.error('Lỗi tải giỏ hàng:', error);
        document.getElementById('cart-loading').style.display = 'none';
        document.getElementById('cart-empty').style.display = '';
    }
}

async function updateQuantity(cartId, newQty) {
    if (newQty <= 0) return;

    const userId = getUserId();
    if (!userId) return;

    showLoading();
    try {
        const res = await api.put(`/cart/${cartId}`, { soluong: newQty });
        if (res.success) {
            await loadCart(); // Tải lại giỏ hàng
        } else {
            alert(res.message || 'Lỗi cập nhật');
        }
    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
    hideLoading();
}


async function removeItem(cartId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    const userId = getUserId();
    if (!userId) return;

    showLoading();
    try {
        const res = await api.delete(`/cart/${cartId}`);
        if (res.success) {
            await loadCart();
        } else {
            alert(res.message || 'Lỗi xóa sản phẩm');
        }
    } catch (error) {
        console.error('Lỗi xóa:', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
    hideLoading();
}
document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            const hasOutOfStockItem = currentCartItems.some(item => {
                const stock = Number(item.soluong_kho) || 0;
                return item.soluong > stock;
            });

            if (hasOutOfStockItem) {
                e.preventDefault();
                alert('Có sản phẩm trong giỏ hàng vượt quá số lượng tồn kho thực tế. Vui lòng giảm số lượng hoặc xóa sản phẩm trước khi thanh toán.');
            }
        });
    }
});
