function getUserId() {
    const id = Number(localStorage.getItem('user_id'));
    return Number.isInteger(id) && id > 0 ? id : null;
}

function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const orderId = Number(params.get('donhang_id'));
    return Number.isInteger(orderId) && orderId > 0 ? orderId : null;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0) + ' VND';
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getPaymentText(method) {
    if (method === 'tienmat') return 'Tiền mặt';
    if (method === 'chuyenkhoan') return 'Chuyển khoản';
    if (method === 'vnpay') return 'VNPay';
    if (method === 'momo') return 'MoMo';
    return method || 'Không xác định';
}

function getStatusText(status) {
    if (status === 'choxacnhan') return 'Chờ xác nhận';
    if (status === 'daxacnhan') return 'Đã xác nhận';
    if (status === 'dangxuly') return 'Đang xử lý';
    if (status === 'danggiao') return 'Đang giao hàng';
    if (status === 'dagiao') return 'Hoàn thành';
    if (status === 'dahuy') return 'Đã hủy';
    return status || 'Không xác định';
}

function getStatusBadgeStyle(status) {
    if (status === 'dagiao') return { bg: '#10b981', text: '#ffffff' };
    if (status === 'dahuy') return { bg: '#ef4444', text: '#ffffff' };
    if (status === 'danggiao') return { bg: '#3b82f6', text: '#ffffff' };
    if (status === 'dangxuly' || status === 'daxacnhan') return { bg: '#f59e0b', text: '#ffffff' };
    return { bg: '#EE4D2D', text: '#ffffff' };
}

function parseSnapshotAddress(snapshot) {
    if (!snapshot) return null;
    if (typeof snapshot === 'object') return snapshot;
    try {
        return JSON.parse(snapshot);
    } catch (error) {
        return null;
    }
}

async function loadSidebarUser() {
    const userId = getUserId();
    if (!userId) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }

    try {
        const res = await api.get(`/profile/${userId}`);
        if (res.success && res.data) {
            const fullname = res.data.fullname || localStorage.getItem('fullname') || 'Người dùng';
            const avatar = imageUtil.avatar(res.data.avatar || localStorage.getItem('avatar') || '');
            const usernameEl = document.getElementById('username');
            const avatarEl = document.getElementById('avatar-img');
            if (usernameEl) usernameEl.textContent = fullname;
            if (avatarEl) avatarEl.src = avatar;
            localStorage.setItem('fullname', fullname);
            if (res.data.avatar) {
                localStorage.setItem('avatar', res.data.avatar);
            }
            return true;
        }
    } catch (error) {
    }

    const usernameEl = document.getElementById('username');
    const avatarEl = document.getElementById('avatar-img');
    if (usernameEl) usernameEl.textContent = localStorage.getItem('fullname') || 'Người dùng';
    if (avatarEl) avatarEl.src = imageUtil.avatar(localStorage.getItem('avatar') || '');
    return true;
}

function renderProducts(items) {
    const container = document.getElementById('order-products');
    if (!container) return;

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = '<p class="orders-empty" style="margin:0;">Không có sản phẩm trong đơn hàng.</p>';
        return;
    }

    container.innerHTML = items.map((item) => {
        const img = imageUtil.product(item.hinhanh_ht || item.hinhanh || '');
        const dongia = Number(item.giaban || item.dongia || 0);
        const soluong = Number(item.soluong || 0);
        const thanhtien = Number(item.thanhtien || dongia * soluong || 0);
        const variant = [item.kichthuoc, item.mausac].filter(Boolean).join(', ');

        return `
            <div class="product-item">
                <img src="${img}" alt="${escapeHtml(item.tensanpham || 'Sản phẩm')}">
                <div class="product-info">
                    <h4>${escapeHtml(item.tensanpham || 'Sản phẩm')}</h4>
                    <p class="variant">Phân loại hàng: ${escapeHtml(variant || 'Không có')}</p>
                    <p class="quantity">Số lượng: x${soluong}</p>
                </div>
                <div class="product-price">
                    <span class="item-total">${formatCurrency(thanhtien)}</span>
                    <span class="unit-price">${formatCurrency(dongia)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderAddress(order) {
    const container = document.getElementById('address-info');
    if (!container) return;

    const snapshot = parseSnapshotAddress(order.snapshot_diachi);
    const tennguoinhan = snapshot?.tennguoinhan || '';
    const sodienthoai = snapshot?.sodienthoai || '';
    const diachichitiet = snapshot?.diachichitiet || '';
    const phuong = snapshot?.phuong || '';
    const quan = snapshot?.quan || '';
    const tinh = snapshot?.tinh || '';

    const fullAddress = [diachichitiet, phuong, quan, tinh].filter(Boolean).join(', ');

    container.innerHTML = `
        <p><i class="fa-solid fa-user"></i>${escapeHtml(tennguoinhan || 'Người nhận không xác định')}</p>
        <p><i class="fa-solid fa-phone"></i>${escapeHtml(sodienthoai || 'Không có số điện thoại')}</p>
        <p><i class="fa-solid fa-location-dot"></i>${escapeHtml(fullAddress || 'Không có địa chỉ')}</p>
    `;
}

function renderPayment(order) {
    const paymentInfo = document.getElementById('payment-info');
    const totals = document.getElementById('order-totals');
    if (!paymentInfo || !totals) return;

    const pttt = order.phuongthucthanhtoan || order.phuongthuc_thanhtoan;

    paymentInfo.innerHTML = `
        <div class="info-row">
            <span class="info-label">Phương thức:</span>
            <span class="info-value">${escapeHtml(getPaymentText(pttt))}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Thanh toán:</span>
            <span class="info-value ${order.trangthai_thanhtoan === 'dathanhtoan' ? 'paid' : 'unpaid'}">
                ${escapeHtml(order.trangthai_thanhtoan === 'dathanhtoan' ? 'Đã thanh toán' : 'Chưa thanh toán')}
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Trạng thái đơn:</span>
            <span class="info-value">${escapeHtml(getStatusText(order.trangthai))}</span>
        </div>
    `;

    const tongtienhang = Number(order.tongtienhang || 0);
    const giamgia = Number(order.giam_gia || 0);
    const phivanchuyen = Number(order.phivanchuyen || 0);
    const tongthanhtoan = Number(order.tongthanhtoan || 0);

    totals.innerHTML = `
        <div class="total-row">
            <span>Tổng tiền hàng</span>
            <span>${formatCurrency(tongtienhang)}</span>
        </div>
        <div class="total-row">
            <span>Giảm giá</span>
            <span>${formatCurrency(giamgia)}</span>
        </div>
        <div class="total-row">
            <span>Phí vận chuyển</span>
            <span>${formatCurrency(phivanchuyen)}</span>
        </div>
        <div class="total-row grand-total">
            <span>Tổng thanh toán</span>
            <span>${formatCurrency(tongthanhtoan)}</span>
        </div>
    `;
}

function renderNote(order) {
    const noteWrap = document.getElementById('order-note-wrap');
    const note = document.getElementById('order-note');
    if (!noteWrap || !note) return;

    if (!order.ghichu) {
        noteWrap.style.display = 'none';
        note.textContent = '';
        return;
    }

    noteWrap.style.display = '';
    note.textContent = order.ghichu;
}

function renderCancelledInfo(order) {
    const cancelled = document.getElementById('order-cancelled');
    if (!cancelled) return;

    if (order.trangthai !== 'dahuy') {
        cancelled.style.display = 'none';
        cancelled.innerHTML = '';
        return;
    }

    const lydo = order.lydo_huy ? `Lý do: ${escapeHtml(order.lydo_huy)}` : 'Đơn hàng đã hủy.';
    cancelled.style.display = '';
    cancelled.innerHTML = `<i class="fa-solid fa-circle-xmark"></i><span>${lydo}</span>`;
}

function updateHeader(order) {
    const title = document.getElementById('order-title');
    const date = document.getElementById('order-date');
    const badge = document.getElementById('order-status-badge');

    const donhangId = Number(order.donhang_id || order.id || 0);
    if (title) {
        const maDon = order.ma_donhang || `DH${String(donhangId).padStart(6, '0')}`;
        title.textContent = `Đơn hàng ${maDon}`;
    }
    if (date) {
        date.textContent = `Ngày đặt: ${formatDate(order.createdAt) || '--'}`;
    }
    if (badge) {
        const status = getStatusText(order.trangthai);
        const style = getStatusBadgeStyle(order.trangthai);
        badge.textContent = status;
        badge.style.background = style.bg;
        badge.style.color = style.text;
    }
}

function bindCancelButton(orderId, currentStatus) {
    const btn = document.getElementById('cancel-order-btn');
    if (!btn) return;

    if (currentStatus !== 'choxacnhan') {
        btn.style.display = 'none';
        btn.onclick = null;
        return;
    }

    btn.style.display = '';
    btn.onclick = async () => {
        const userId = getUserId();
        if (!userId) {
            window.location.href = '/pages/auth/login.html';
            return;
        }

        const lydo = window.prompt('Nhập lý do hủy đơn hàng:', 'Thay đổi ý định mua hàng');
        if (lydo === null) return;

        btn.disabled = true;
        try {
            const res = await api.patch(`/orders/${orderId}/cancel`, {
                user_id: userId,
                lydo_huy: lydo.trim()
            });

            if (!res.success) {
                alert(res.message || 'Không thể hủy đơn hàng');
                return;
            }

            alert('Hủy đơn hàng thành công');
            await loadOrderDetail();
        } catch (error) {
            alert('Lỗi kết nối máy chủ');
        } finally {
            btn.disabled = false;
        }
    };
}

async function loadOrderDetail() {
    const loading = document.getElementById('detail-loading');
    const errorBox = document.getElementById('detail-error');
    const main = document.getElementById('detail-main');

    if (loading) loading.style.display = '';
    if (errorBox) {
        errorBox.style.display = 'none';
        errorBox.textContent = '';
    }
    if (main) main.style.display = 'none';

    const userId = getUserId();
    const orderId = getOrderIdFromUrl();

    if (!userId) {
        window.location.href = '/pages/auth/login.html';
        return;
    }

    if (!orderId) {
        if (loading) loading.style.display = 'none';
        if (errorBox) {
            errorBox.style.display = '';
            errorBox.textContent = 'Không tìm thấy mã đơn hàng trong URL.';
        }
        return;
    }

    try {
        const res = await api.get(`/orders/${orderId}?user_id=${userId}`);
        if (!res.success || !res.data) {
            throw new Error(res.message || 'Không tìm thấy chi tiết đơn hàng');
        }

        const order = res.data;
        updateHeader(order);
        renderProducts(order.chitiet || []);
        renderAddress(order);
        renderPayment(order);
        renderNote(order);
        renderCancelledInfo(order);
        bindCancelButton(orderId, order.trangthai);

        if (loading) loading.style.display = 'none';
        if (main) main.style.display = '';
    } catch (error) {
        if (loading) loading.style.display = 'none';
        if (errorBox) {
            errorBox.style.display = '';
            errorBox.textContent = error.message || 'Đã xảy ra lỗi khi tải chi tiết đơn hàng.';
        }
    }
}

async function init() {
    const loaded = await loadSidebarUser();
    if (!loaded) return;
    await loadOrderDetail();
}

document.addEventListener('DOMContentLoaded', init);
