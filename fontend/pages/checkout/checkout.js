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

function resetPlaceOrderButton() {
    const btnOrder = document.getElementById('btn-place-order');
    if (!btnOrder) return;
    btnOrder.disabled = false;
    btnOrder.innerHTML = '<i class="fas fa-check"></i> Đặt Hàng';
}

// ===== Biến toàn cục =====
let cartItems = [];
let cartTotal = 0;
let addresses = [];
let selectedAddress = null;
let buyNowItem = null;
const ADDRESS_PAGE_URL = '/pages/profile/address.html';

function renderNoAddressState() {
    const display = document.getElementById('address-display');
    const btnChange = document.getElementById('btn-change-address');
    if (!display) return;

    display.innerHTML = `
        <div class="no-address" id="no-address">
            <p>Bạn chưa có địa chỉ nhận hàng.</p>
            <a href="${ADDRESS_PAGE_URL}" class="btn-change">
                <i class="fas fa-plus"></i> Thêm địa chỉ
            </a>
        </div>
    `;

    if (btnChange) {
        btnChange.style.display = 'none';
    }
}

// ===== Render sản phẩm trong checkout =====
function renderCheckoutItems(items) {
    const container = document.getElementById('checkout-items');
    let html = '';

    items.forEach(item => {
        const giaban = Number(item.giaban) || 0;
        const giakm = Number(item.giakhuyenmai) || 0;
        const coGiam = giakm > 0 && giakm < giaban;
        const dongia = coGiam ? giakm : giaban;
        const thanhtien = dongia * item.soluong;

        const hinhanh = item.hinhanh_bienthe || item.hinhanh || '';
        const imgSrc = imageUtil.product(hinhanh);

        let variantHtml = '';
        if (item.mausac || item.kichthuoc) {
            let parts = [];
            if (item.mausac) parts.push(`Màu: ${item.mausac}`);
            if (item.kichthuoc) parts.push(`Size: ${item.kichthuoc}`);
            variantHtml = `<p class="order-item-variant">${parts.join(' | ')}</p>`;
        }

        html += `
            <div class="order-item">
                <img src="${imgSrc}" alt="${item.tensanpham}" class="order-item-img">
                <div class="order-item-info">
                    <p class="order-item-name">${item.tensanpham}</p>
                    ${variantHtml}
                    <div class="order-item-price">
                        <span class="price-value">${formatCurrency(dongia)}</span>
                        <span class="price-qty">x${item.soluong}</span>
                    </div>
                </div>
                <div class="order-item-total">${formatCurrency(thanhtien)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ===== Render địa chỉ đã chọn =====
function renderSelectedAddress(addr) {
    const display = document.getElementById('address-display');
    const btnChange = document.getElementById('btn-change-address');
    if (!display) return;

    if (!addr) {
        renderNoAddressState();
        return;
    }

    if (btnChange) {
        btnChange.style.display = '';
    }

    display.innerHTML = `
        <div class="address-card">
            <div class="address-main">
                <strong class="recipient-name">${addr.tennguoinhan}</strong>
                <span class="recipient-phone">${addr.sodienthoai}</span>
                ${addr.macdinh ? '<span class="badge-default">Mặc Định</span>' : ''}
            </div>
            <p class="recipient-address">
                ${addr.diachichitiet}, ${addr.phuong}, ${addr.quan}, ${addr.tinh}
            </p>
        </div>
    `;
}

function updateSummary() {
    const phiVanChuyen = 30000;
    const tongCong = Number(cartTotal) + phiVanChuyen;

    document.getElementById('checkout-item-count').textContent = cartItems.length;
    document.getElementById('summary-count').textContent = cartItems.length;
    document.getElementById('summary-subtotal').textContent = formatCurrency(cartTotal);
    document.getElementById('summary-total').textContent = formatCurrency(tongCong);
}

// ===== Modal chọn địa chỉ =====
function openAddressModal() {
    const container = document.getElementById('address-list');
    if (!container) return;

    if (!addresses.length) {
        container.innerHTML = `
            <div class="no-address">
                <p>Bạn chưa có địa chỉ nhận hàng.</p>
                <a href="${ADDRESS_PAGE_URL}" class="btn-confirm">
                    <i class="fas fa-plus"></i> Thêm địa chỉ
                </a>
            </div>
        `;

        document.getElementById('addressModal').classList.add('active');
        return;
    }

    let html = '';

    addresses.forEach(addr => {
        const isSelected = selectedAddress && selectedAddress.id === addr.id;
        html += `
            <div class="address-option ${isSelected ? 'selected' : ''}" onclick="selectAddressInModal(this, ${addr.id})">
                <input type="radio" name="modal_address" value="${addr.id}" ${isSelected ? 'checked' : ''}>
                <div class="address-detail">
                    <div class="address-name-phone">
                        <strong>${addr.tennguoinhan}</strong>
                        <span>${addr.sodienthoai}</span>
                        ${addr.macdinh ? '<span class="badge-default">Mặc Định</span>' : ''}
                    </div>
                    <p>${addr.diachichitiet}, ${addr.phuong}, ${addr.quan}, ${addr.tinh}</p>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('addressModal').classList.add('active');
}

function closeAddressModal() {
    document.getElementById('addressModal').classList.remove('active');
}

let tempSelectedAddressId = null;

function selectAddressInModal(element, id) {
    document.querySelectorAll('.address-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
    tempSelectedAddressId = id;
}

function confirmAddress() {
    if (tempSelectedAddressId) {
        selectedAddress = addresses.find(a => a.id === tempSelectedAddressId);
        renderSelectedAddress(selectedAddress);
    }
    closeAddressModal();
}

// ===== Đặt hàng =====
async function placeOrder() {
    const userId = getUserId();
    if (!userId) return;

    if (!selectedAddress) {
        alert('Vui lòng chọn địa chỉ nhận hàng');
        return;
    }

    const selectedPaymentMethod = document.querySelector('input[name="phuongthucthanhtoan"]:checked')?.value || 'tienmat';
    const orderNote = document.getElementById('order-note')?.value.trim() || '';

    // Disable nút đặt hàng
    const btnOrder = document.getElementById('btn-place-order');
    btnOrder.disabled = true;
    btnOrder.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    showLoading();
    try {
        const payload = {
            user_id: Number(userId),
            diachi_id: selectedAddress.id,
            ghichu: orderNote,
            phuongthuc_thanhtoan: selectedPaymentMethod
        };

        if (buyNowItem) {
            payload.items = [{
                sanpham_id: Number(buyNowItem.sanpham_id),
                bienthe_id: buyNowItem.bienthe_id ?? null,
                soluong: Number(buyNowItem.soluong || 1)
            }];
        }

        const res = await api.post('/orders', payload);

        if (!res.success) {
            alert(res.message || 'Lỗi đặt hàng');
            resetPlaceOrderButton();
            return;
        }

        if (buyNowItem) {
            localStorage.removeItem('buy_now_item');
        }

        const isMomoPayment = selectedPaymentMethod === 'momo' || selectedPaymentMethod === 'chuyenkhoan';

        if (isMomoPayment) {
            const payUrl = res?.data?.payUrl;

            if (payUrl) {
                window.location.href = payUrl;
                return;
            }

            hideLoading();
            resetPlaceOrderButton();
            alert(res?.message || 'Không tạo được link thanh toán. Vui lòng thử lại.');
            return;
        }

        // Hiển thị thành công
        document.getElementById('checkout-content').style.display = 'none';
        document.getElementById('checkout-success').style.display = '';
        document.getElementById('order-code').textContent = res.data.ma_donhang;
        document.getElementById('order-total-display').textContent = formatCurrency(res.data.tongthanhtoan);
    } catch (error) {
        console.error('Lỗi đặt hàng:', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại.');
        resetPlaceOrderButton();
    }
    hideLoading();
}

// ===== Tải dữ liệu =====
async function loadAddresses() {
    const userId = getUserId();
    if (!userId) return;

    try {
        const res = await api.get('/address');
        if (res.success) {
            addresses = Array.isArray(res.data) ? res.data : [];

            // Chọn mặc định
            if (addresses.length > 0) {
                const defaultAddr = addresses.find(a => a.macdinh) || addresses[0];
                selectedAddress = defaultAddr;
            } else {
                selectedAddress = null;
            }
            renderSelectedAddress(selectedAddress);
            return;
        }

        addresses = [];
        selectedAddress = null;
        renderSelectedAddress(null);
    } catch (error) {
        console.error('Lỗi tải địa chỉ:', error);
        addresses = [];
        selectedAddress = null;
        renderSelectedAddress(null);
    }
}

async function init() {
    const userId = getUserId();
    const urlParams = new URLSearchParams(window.location.search);
    const isBuyNowMode = urlParams.get('mode') === 'buynow';

    // Kiểm tra đăng nhập
    if (!userId) {
        document.getElementById('checkout-loading').style.display = 'none';
        document.getElementById('checkout-not-logged').style.display = '';
        return;
    }

    try {
        // Tải địa chỉ để chọn trước khi đặt hàng
        await loadAddresses();

        if (isBuyNowMode) {
            const rawBuyNow = localStorage.getItem('buy_now_item');
            if (rawBuyNow) {
                try {
                    const parsedBuyNow = JSON.parse(rawBuyNow);
                    if (Number(parsedBuyNow?.user_id) === Number(userId)) {
                        buyNowItem = parsedBuyNow;
                        cartItems = [buyNowItem];
                        const giaban = Number(buyNowItem.giaban) || 0;
                        const giakm = Number(buyNowItem.giakhuyenmai) || 0;
                        const dongia = giakm > 0 && giakm < giaban ? giakm : giaban;
                        cartTotal = dongia * Number(buyNowItem.soluong || 1);
                    }
                } catch (error) {
                    localStorage.removeItem('buy_now_item');
                }
            }
        }

        if (!buyNowItem) {
            const cartRes = await api.get('/cart');
            if (!cartRes.success || !Array.isArray(cartRes?.data?.items) || cartRes.data.items.length === 0) {
                document.getElementById('checkout-loading').style.display = 'none';
                document.getElementById('checkout-empty').style.display = '';
                return;
            }

            cartItems = cartRes.data.items;
            cartTotal = cartRes.data.tongtien;
        }
        document.getElementById('checkout-loading').style.display = 'none';
        document.getElementById('checkout-content').style.display = '';

        renderCheckoutItems(cartItems);
        updateSummary();

    } catch (error) {
        console.error('Lỗi tải checkout:', error);
        document.getElementById('checkout-loading').style.display = 'none';
        document.getElementById('checkout-empty').style.display = '';
    }
}

document.addEventListener('DOMContentLoaded', init);