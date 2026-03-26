/**
 * Checkout Page - Thanh toán
 * Kiểm tra đăng nhập bằng localStorage (user_id)
 * Gọi API: /cart, /address, /orders
 */

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

// ===== Biến toàn cục =====
let cartItems = [];
let cartTotal = 0;
let addresses = [];
let selectedAddress = null;

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
    const noAddress = document.getElementById('no-address');

    if (!addr) {
        if (noAddress) noAddress.style.display = '';
        btnChange.style.display = 'none';
        return;
    }

    if (noAddress) noAddress.style.display = 'none';
    btnChange.style.display = '';

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

// ===== Cập nhật tóm tắt đơn hàng =====
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

// ===== Modal thêm địa chỉ =====
function openAddAddressForm() {
    document.getElementById('addAddressModal').classList.add('active');
}

function closeAddAddressForm() {
    document.getElementById('addAddressModal').classList.remove('active');
}

async function saveNewAddress() {
    const userId = getUserId();
    if (!userId) return;

    const data = {
        user_id: Number(userId),
        tennguoinhan: document.getElementById('new-tennguoinhan').value.trim(),
        sodienthoai: document.getElementById('new-sodienthoai').value.trim(),
        diachichitiet: document.getElementById('new-diachichitiet').value.trim(),
        phuong: document.getElementById('new-phuong').value.trim(),
        quan: document.getElementById('new-quan').value.trim(),
        tinh: document.getElementById('new-tinh').value.trim(),
        macdinh: addresses.length === 0 ? 1 : 0
    };

    // Validate
    if (!data.tennguoinhan || !data.sodienthoai || !data.diachichitiet || !data.phuong || !data.quan || !data.tinh) {
        alert('Vui lòng nhập đầy đủ thông tin địa chỉ');
        return;
    }

    showLoading();
    try {
        const res = await api.post('/address', data);
        if (res.success) {
            closeAddAddressForm();
            // Tải lại danh sách địa chỉ
            await loadAddresses();
            alert('Thêm địa chỉ thành công!');
        } else {
            alert(res.message || 'Lỗi thêm địa chỉ');
        }
    } catch (error) {
        console.error('Lỗi thêm địa chỉ:', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
    hideLoading();
}

// ===== Đặt hàng =====
async function placeOrder() {
    const userId = getUserId();
    if (!userId) return;

    if (!selectedAddress) {
        alert('Vui lòng chọn địa chỉ nhận hàng');
        return;
    }

    const phuongthuc = document.querySelector('input[name="phuongthucthanhtoan"]:checked')?.value || 'tienmat';
    const ghichu = document.getElementById('order-note')?.value.trim() || '';

    // Disable nút đặt hàng
    const btnOrder = document.getElementById('btn-place-order');
    btnOrder.disabled = true;
    btnOrder.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    showLoading();
    try {
        const res = await api.post('/orders', {
            user_id: Number(userId),
            diachi_id: selectedAddress.id,
            ghichu,
            phuongthuc_thanhtoan: phuongthuc
        });

        if (res.success) {
            // Hiển thị thành công
            document.getElementById('checkout-content').style.display = 'none';
            document.getElementById('checkout-success').style.display = '';
            document.getElementById('order-code').textContent = res.data.ma_donhang;
            document.getElementById('order-total-display').textContent = formatCurrency(res.data.tongthanhtoan);
        } else {
            alert(res.message || 'Lỗi đặt hàng');
            btnOrder.disabled = false;
            btnOrder.innerHTML = '<i class="fas fa-check"></i> Đặt Hàng';
        }
    } catch (error) {
        console.error('Lỗi đặt hàng:', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại.');
        btnOrder.disabled = false;
        btnOrder.innerHTML = '<i class="fas fa-check"></i> Đặt Hàng';
    }
    hideLoading();
}

// ===== Tải dữ liệu =====
async function loadAddresses() {
    const userId = getUserId();
    try {
        const res = await api.get(`/address?user_id=${userId}`);
        if (res.success) {
            addresses = res.data || [];

            // Chọn mặc định
            if (addresses.length > 0) {
                const defaultAddr = addresses.find(a => a.macdinh) || addresses[0];
                selectedAddress = defaultAddr;
                renderSelectedAddress(selectedAddress);
            }
        }
    } catch (error) {
        console.error('Lỗi tải địa chỉ:', error);
    }
}

async function init() {
    const userId = getUserId();

    // Kiểm tra đăng nhập
    if (!userId) {
        document.getElementById('checkout-loading').style.display = 'none';
        document.getElementById('checkout-not-logged').style.display = '';
        return;
    }

    try {
        // Tải song song: giỏ hàng + địa chỉ
        const [cartRes, addrRes] = await Promise.all([
            api.get(`/cart?user_id=${userId}`),
            api.get(`/address?user_id=${userId}`)
        ]);

        // Xử lý giỏ hàng
        if (!cartRes.success || !cartRes.data.items || cartRes.data.items.length === 0) {
            document.getElementById('checkout-loading').style.display = 'none';
            document.getElementById('checkout-empty').style.display = '';
            return;
        }

        cartItems = cartRes.data.items;
        cartTotal = cartRes.data.tongtien;

        // Xử lý địa chỉ
        if (addrRes.success) {
            addresses = addrRes.data || [];
            if (addresses.length > 0) {
                selectedAddress = addresses.find(a => a.macdinh) || addresses[0];
            }
        }

        // Render
        document.getElementById('checkout-loading').style.display = 'none';
        document.getElementById('checkout-content').style.display = '';

        renderCheckoutItems(cartItems);
        renderSelectedAddress(selectedAddress);
        updateSummary();

    } catch (error) {
        console.error('Lỗi tải checkout:', error);
        document.getElementById('checkout-loading').style.display = 'none';
        document.getElementById('checkout-empty').style.display = '';
    }
}

document.addEventListener('DOMContentLoaded', init);
