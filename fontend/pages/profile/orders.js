let allOrders = [];
let activeStatus = 'all';

function getUserId() {
    const id = Number(localStorage.getItem('user_id'));
    return Number.isInteger(id) && id > 0 ? id : null;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0) + ' VND';
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
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

function formatVariant(kichthuoc, mausac) {
    const parts = [];
    if (kichthuoc) parts.push(kichthuoc);
    if (mausac) parts.push(mausac);
    return parts.join(', ');
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderProducts(order) {
    const items = Array.isArray(order.chitiet) ? order.chitiet : [];
    if (!items.length) {
        return '<p>Lỗi hiển thị</p>';
    }

    return items.map((sanpham) => {
        const gia = Number(sanpham.giaban || sanpham.dongia || 0);
        const soluong = Number(sanpham.soluong || 0);
        const imgSrc = imageUtil.product(sanpham.hinhanh_ht || sanpham.hinhanh || '');

        return `
            <div class="sanpham-item">
                <img src="${imgSrc}" alt="${escapeHtml(sanpham.tensanpham || 'Sản phẩm')}">
                <div class="sanpham-item-info">
                    <p class="sanpham-item-info-top">${escapeHtml(sanpham.tensanpham || 'Sản phẩm')}</p>
                    <div class="sanpham-item-info-bottom">
                        <div class="sanpham-item-info-bottom-left">
                            <p class="phanloai">Phân loại hàng: ${escapeHtml(formatVariant(sanpham.kichthuoc, sanpham.mausac) || 'Không có')}</p>
                            <p class="soluong">x${soluong}</p>
                        </div>
                        <p class="gia">${formatCurrency(gia)}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderCancelModal(order, donhangId) {
    if (order.trangthai !== 'choxacnhan') return '';

    const sanphamList = (Array.isArray(order.chitiet) ? order.chitiet : []).map((sanpham) => {
        const imgSrc = imageUtil.product(sanpham.hinhanh_ht || sanpham.hinhanh || '');
        return `
            <div class="sanpham-item" style="font-size: 0.9em;">
                <img src="${imgSrc}" alt="${escapeHtml(sanpham.tensanpham || 'Sản phẩm')}" style="width: 50px; height: 50px;">
                <div class="sanpham-item-info">
                    <p>${escapeHtml(sanpham.tensanpham || 'Sản phẩm')}</p>
                    <p class="phanloai">Phân loại hàng: ${escapeHtml(formatVariant(sanpham.kichthuoc, sanpham.mausac) || 'Không có')}</p>
                    <p class="soluong">x${Number(sanpham.soluong || 0)}</p>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="Modal_huy" id-donhang="${donhangId}">
            <div class="modal-content">
                <h2>Hủy Đơn Hàng</h2>
                <form class="cancel-order-form" id-donhang="${donhangId}">
                    <div class="form-group">
                        <div class="sanpham-list-mini" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px;">
                            ${sanphamList}
                        </div>
                        <label for="lydo-${donhangId}">Lý do hủy:</label>
                        <input list="list-lydo-${donhangId}" id="lydo-${donhangId}" name="lydo" required placeholder="Chọn hoặc nhập lý do...">
                        <datalist id="list-lydo-${donhangId}">
                            <option value="Thay đổi ý định mua hàng">
                            <option value="Đặt nhầm thông tin đơn hàng">
                            <option value="Vấn đề về thanh toán">
                        </datalist>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="closeModal">Đóng</button>
                        <button type="submit">Xác nhận Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function matchStatus(order, status) {
    if (status === 'all') return true;
    if (status === 'dangxuly') {
        return order.trangthai === 'dangxuly' || order.trangthai === 'daxacnhan';
    }
    return order.trangthai === status;
}

function renderOrderCard(order) {
    const donhangId = Number(order.donhang_id || order.id);
    const showCancel = order.trangthai === 'choxacnhan';
    const phuongThuc = order.phuongthucthanhtoan || order.phuongthuc_thanhtoan;
    const maDonhang = String(order.ma_donhang || `DH${donhangId}`);

    return `
        <div class="order-item" id-donhang="${donhangId}" data-ma-donhang="${escapeHtml(maDonhang)}">
            ${renderCancelModal(order, donhangId)}
            <div class="tren">
                <p class="madh">Mã đơn hàng: ${escapeHtml(maDonhang)}</p>
                <p class="pttt">${getPaymentText(phuongThuc)} &nbsp; | &nbsp; ${getStatusText(order.trangthai)}</p>
            </div>
            <div class="giua">
                ${renderProducts(order)}
            </div>
            <div class="duoi">
                ${showCancel ? `<a href="#" class="huy openModal" id-donhang="${donhangId}">Hủy</a>` : ''}
                <div class="duoi-right">
                    <a href="./order-detail.html?donhang_id=${donhangId}" class="chitiet">Chi tiết</a>
                    <p class="tongtien">Tổng tiền: ${formatCurrency(order.tongthanhtoan)}</p>
                </div>
            </div>
        </div>
    `;
}

function renderOrders() {
    const loading = document.getElementById('orders-loading');
    const empty = document.getElementById('orders-empty');
    const content = document.getElementById('orders-content');

    const filtered = allOrders.filter(order => matchStatus(order, activeStatus));

    if (loading) loading.style.display = 'none';

    if (!filtered.length) {
        if (empty) empty.style.display = '';
        if (content) content.innerHTML = '';
        return;
    }

    if (empty) empty.style.display = 'none';
    if (content) content.innerHTML = filtered.map(renderOrderCard).join('');
}

function setActiveTab(status) {
    activeStatus = status;
    const tabs = document.querySelectorAll('#order-tabs a[data-status]');
    tabs.forEach((tab) => {
        if (tab.dataset.status === status) {
            tab.classList.add('order-list-active');
        } else {
            tab.classList.remove('order-list-active');
        }
    });
    renderOrders();
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
            document.getElementById('username').textContent = fullname;
            document.getElementById('avatar-img').src = avatar;
            localStorage.setItem('fullname', fullname);
            if (res.data.avatar) {
                localStorage.setItem('avatar', res.data.avatar);
            }
            return true;
        }
    } catch (error) {
    }

    document.getElementById('username').textContent = localStorage.getItem('fullname') || 'Người dùng';
    document.getElementById('avatar-img').src = imageUtil.avatar(localStorage.getItem('avatar') || '');
    return true;
}

async function loadOrders() {
    const userId = getUserId();
    if (!userId) return;

    const loading = document.getElementById('orders-loading');
    if (loading) loading.style.display = '';

    try {
        const listRes = await api.get(`/orders?user_id=${userId}`);
        if (!listRes.success || !Array.isArray(listRes.data) || !listRes.data.length) {
            allOrders = [];
            renderOrders();
            return;
        }

        const detailRequests = listRes.data.map(async (order) => {
            const donhangId = Number(order.donhang_id || order.id);
            try {
                const detailRes = await api.get(`/orders/${donhangId}?user_id=${userId}`);
                if (detailRes.success && detailRes.data) {
                    return detailRes.data;
                }
            } catch (error) {
            }
            return { ...order, chitiet: [] };
        });

        allOrders = await Promise.all(detailRequests);
        allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        renderOrders();
    } catch (error) {
        allOrders = [];
        renderOrders();
    }
}

function openCancelModal(orderId) {
    const modal = document.querySelector(`.Modal_huy[id-donhang="${orderId}"]`);
    if (!modal) return;
    modal.classList.add('show');
}

function closeCancelModal(target) {
    const modal = target.closest('.Modal_huy');
    if (!modal) return;
    modal.classList.remove('show');
}

async function submitCancelOrder(formElement) {
    const userId = getUserId();
    if (!userId) {
        window.location.href = '/pages/auth/login.html';
        return;
    }

    const orderId = Number(formElement.getAttribute('id-donhang'));
    const lydo = formElement.querySelector('input[name="lydo"]')?.value?.trim() || '';
    const submitBtn = formElement.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await api.patch(`/orders/${orderId}/cancel`, {
            user_id: userId,
            lydo_huy: lydo
        });

        if (!res.success) {
            alert(res.message || 'Không thể hủy đơn hàng');
            return;
        }

        alert('Hủy đơn hàng thành công');
        const modal = formElement.closest('.Modal_huy');
        if (modal) modal.classList.remove('show');
        await loadOrders();
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

function bindEvents() {
    document.getElementById('order-tabs')?.addEventListener('click', (event) => {
        const tab = event.target.closest('a[data-status]');
        if (!tab) return;
        event.preventDefault();
        setActiveTab(tab.dataset.status);
    });

    const ordersContent = document.getElementById('orders-content');
    ordersContent?.addEventListener('click', (event) => {
        const openModalBtn = event.target.closest('.openModal');
        if (openModalBtn) {
            event.preventDefault();
            const orderId = Number(openModalBtn.getAttribute('id-donhang'));
            openCancelModal(orderId);
            return;
        }

        const closeModalBtn = event.target.closest('.closeModal');
        if (closeModalBtn) {
            event.preventDefault();
            closeCancelModal(closeModalBtn);
        }
    });

    ordersContent?.addEventListener('submit', async (event) => {
        const form = event.target.closest('.cancel-order-form');
        if (!form) return;
        event.preventDefault();
        await submitCancelOrder(form);
    });

    window.addEventListener('click', (event) => {
        const modal = event.target.closest('.Modal_huy');
        if (modal && event.target === modal) {
            modal.classList.remove('show');
        }
    });
}

async function init() {
    const loaded = await loadSidebarUser();
    if (!loaded) return;
    bindEvents();
    await loadOrders();
}

document.addEventListener('DOMContentLoaded', init);