/**
 * Cart Page - Quản lý giỏ hàng
 * Kiểm tra đăng nhập bằng localStorage (user_id)
 * Gọi API backend để CRUD giỏ hàng
 */

// Hàm định dạng tiền VND
function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0) + '₫';
}

// Lấy user_id từ localStorage
function getUserId() {
    return localStorage.getItem('user_id');
}

// Hiển thị loading overlay
function showLoading() {
    document.getElementById('loadingOverlay')?.classList.add('active');
}
function hideLoading() {
    document.getElementById('loadingOverlay')?.classList.remove('active');
}

// Render 1 item trong giỏ hàng
function renderCartItem(item) {
    const giaban = Number(item.giaban) || 0;
    const giakm = Number(item.giakhuyenmai) || 0;
    const coGiam = giakm > 0 && giakm < giaban;
    const giaHienThi = coGiam ? giakm : giaban;
    const soluongKho = Number(item.soluong_kho) || 999;

    // Ảnh sản phẩm
    const hinhanh = item.hinhanh_bienthe || item.hinhanh || '';
    const imgSrc = imageUtil.product(hinhanh);

    // Thông tin biến thể
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

    // Cảnh báo tồn kho
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

// Render toàn bộ giỏ hàng
function renderCart(data) {
    const { items, tongtien } = data;
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

    // Render items
    const itemsHtml = items.map(renderCartItem).join('');
    document.getElementById('cart-items').innerHTML = itemsHtml;

    // Cập nhật tóm tắt
    const phiVanChuyen = 30000;
    const tongCong = Number(tongtien) + phiVanChuyen;

    document.getElementById('item-count').textContent = items.length;
    document.getElementById('subtotal').textContent = formatCurrency(tongtien);
    document.getElementById('total').textContent = formatCurrency(tongCong);
}

// Tải giỏ hàng từ API
async function loadCart() {
    const userId = getUserId();
    if (!userId) {
        document.getElementById('cart-loading').style.display = 'none';
        document.getElementById('cart-not-logged').style.display = '';
        return;
    }

    try {
        const res = await api.get(`/cart?user_id=${userId}`);
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

// Cập nhật số lượng
async function updateQuantity(cartId, newQty) {
    if (newQty <= 0) return;

    const userId = getUserId();
    if (!userId) return;

    showLoading();
    try {
        const res = await api.put(`/cart/${cartId}`, { user_id: Number(userId), soluong: newQty });
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

// Xóa sản phẩm khỏi giỏ
async function removeItem(cartId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    const userId = getUserId();
    if (!userId) return;

    showLoading();
    try {
        const res = await api.delete(`/cart/${cartId}?user_id=${userId}`);
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

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', loadCart);
