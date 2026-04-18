function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0) + ' VND';
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getQuery(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || '';
}

function setQuery(query) {
    const url = new URL(window.location.href);
    Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value === null || value === undefined || value === '') {
            url.searchParams.delete(key);
            return;
        }
        url.searchParams.set(key, value);
    });
    window.location.href = url.toString();
}

function getStatusText(status) {
    if (status === 'choxacnhan') return 'Chờ xác nhận';
    if (status === 'daxacnhan') return 'Đang xử lý';
    if (status === 'dangxuly') return 'Đang xử lý';
    if (status === 'danggiao') return 'Đang giao';
    if (status === 'dagiao') return 'Đã giao';
    if (status === 'dahuy') return 'Đã hủy';
    return status || 'Không xác định';
}

function getPaymentText(method) {
    if (method === 'tienmat') return 'Tiền mặt';
    if (method === 'chuyenkhoan') return 'Chuyển khoản';
    if (method === 'vnpay') return 'VNPay';
    if (method === 'momo') return 'MoMo';
    return method || 'Không xác định';
}

function getPaymentStatusText(status) {
    if (status === 'chuathanhtoan') return 'Chưa thanh toán';
    if (status === 'dathanhtoan') return 'Đã thanh toán';
    if (status === 'hoantien') return 'Hoàn tiền';
    return status || 'Không xác định';
}

function getFrontendBasePath() {
    const pathname = window.location.pathname || '';
    const normalized = pathname.toLowerCase();
    const marker = '/fontend/';
    const markerIndex = normalized.indexOf(marker);
    if (markerIndex === -1) {
        return '';
    }
    return pathname.slice(0, markerIndex + marker.length - 1);
}

const FRONTEND_BASE_PATH = getFrontendBasePath();

function withFrontendBase(path) {
    if (!path) return FRONTEND_BASE_PATH || '';
    if (/^(https?:)?\/\//i.test(path)) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${FRONTEND_BASE_PATH}${normalized}`;
}

function adminLogout() {
    ['token', 'isLoggedIn', 'role', 'user_id', 'username', 'fullname', 'avatar'].forEach((key) => {
        localStorage.removeItem(key);
    });
    window.location.href = withFrontendBase('/pages/auth/login.html');
}

function ensureAdminAccess() {
    const isLogged = localStorage.getItem('isLoggedIn') === 'true';
    const role = (localStorage.getItem('role') || '').toLowerCase();
    if (isLogged && role === 'admin') {
        return true;
    }
    window.location.href = withFrontendBase('/pages/auth/login.html');
    return false;
}

function renderAdminTopbar() {
    if (document.querySelector('.admin-topbar')) return;

    const fullName = escapeHtml(localStorage.getItem('fullname') || 'Quản trị viên');
    const username = escapeHtml(localStorage.getItem('username') || 'admin');

    const topbar = document.createElement('header');
    topbar.className = 'admin-topbar';
    topbar.innerHTML = `
        <div class="admin-topbar-inner">
            <a class="admin-brand" href="${withFrontendBase('/pages/admin/index.html')}">
                <span class="admin-brand-mark">A</span>
                <span class="admin-brand-text">
                    <strong>KTTKPM Admin</strong>
                    <small>Bảng điều khiển</small>
                </span>
            </a>
            <nav class="admin-nav-links">
                <a href="${withFrontendBase('/pages/admin/index.html')}">Tổng quan</a>
                <a href="${withFrontendBase('/index.html')}">Trang người dùng</a>
            </nav>
            <div class="admin-user-actions">
                <div class="admin-user-pill">
                    <strong>${fullName}</strong>
                    <span>@${username}</span>
                </div>
                <button type="button" class="btn btn-danger btn-small" id="admin-logout-btn">Đăng xuất</button>
            </div>
        </div>
    `;

    document.body.prepend(topbar);
    topbar.querySelector('#admin-logout-btn')?.addEventListener('click', adminLogout);
}

function layTrangThaiTiepTheo(trangthai) {
    if (trangthai === 'choxacnhan') return 'dangxuly';
    if (trangthai === 'daxacnhan') return 'danggiao';
    if (trangthai === 'dangxuly') return 'danggiao';
    if (trangthai === 'danggiao') return 'dagiao';
    return '';
}

const adminApi = {
    get: (endpoint) => api.get(`/admin${endpoint}`),
    post: (endpoint, body) => api.post(`/admin${endpoint}`, body),
    put: (endpoint, body) => api.put(`/admin${endpoint}`, body),
    patch: (endpoint, body) => api.patch(`/admin${endpoint}`, body),
    delete: (endpoint) => api.delete(`/admin${endpoint}`),
    upload: (endpoint, formData) => api.upload(`/admin${endpoint}`, formData)
};

document.addEventListener('DOMContentLoaded', () => {
    if (!ensureAdminAccess()) return;
    renderAdminTopbar();
});

window.adminLogout = adminLogout;
