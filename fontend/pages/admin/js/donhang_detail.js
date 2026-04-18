let currentOrder = null;

function renderInfo(order) {
    const info = document.getElementById('order-info-grid');
    const subtitle = document.getElementById('order-subtitle');

    if (subtitle) {
        subtitle.textContent = `Đơn #${escapeHtml(order.ma_donhang || `DH${order.donhang_id}`)}`;
    }

    if (!info) return;

    info.innerHTML = `
        <div><strong>Mã đơn</strong><span>${escapeHtml(order.ma_donhang || `DH${order.donhang_id}`)}</span></div>
        <div><strong>Khách hàng</strong><span>${escapeHtml(order.ten_khachhang || 'N/A')}</span></div>
        <div><strong>Email</strong><span>${escapeHtml(order.email_khachhang || 'N/A')}</span></div>
        <div><strong>SDT</strong><span>${escapeHtml(order.sdt_khachhang || 'N/A')}</span></div>
        <div><strong>Người nhận</strong><span>${escapeHtml(order.tennguoinhan || 'N/A')}</span></div>
        <div><strong>Địa chỉ</strong><span>${escapeHtml([order.diachichitiet, order.phuong, order.quan, order.tinh].filter(Boolean).join(', ') || 'N/A')}</span></div>
        <div><strong>Ngày tạo</strong><span>${formatDate(order.ngaytao || order.createdAt)}</span></div>
        <div><strong>Tổng thanh toán</strong><span>${formatCurrency(order.tongthanhtoan)}</span></div>
    `;

    const statusText = document.getElementById('status-text');
    const paymentStatusText = document.getElementById('payment-status-text');
    if (statusText) statusText.textContent = `Trạng thái: ${getStatusText(order.trangthai)}`;
    if (paymentStatusText) paymentStatusText.textContent = `Thanh toán: ${getPaymentStatusText(order.trangthaithanhtoan || order.trangthai_thanhtoan)}`;
}

function renderProgress(order) {
    const steps = ['choxacnhan', 'dangxuly', 'danggiao', 'dagiao'];
    const current = order.trangthai;
    const currentIndex = steps.indexOf(current);
    const wrap = document.getElementById('progress-steps');
    if (!wrap) return;

    wrap.innerHTML = steps.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending';
        return `<span class="step ${state}">${getStatusText(step)}</span>`;
    }).join('');
}

function renderProducts(order) {
    const tbody = document.getElementById('order-product-body');
    if (!tbody) return;
    const products = Array.isArray(order.sanpham) ? order.sanpham : [];

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">Không có sản phẩm</td></tr>';
        return;
    }

    tbody.innerHTML = products.map((sp) => {
        const phanloai = [sp.kichthuoc, sp.mausac].filter(Boolean).join(' - ');
        return `
            <tr>
                <td>${escapeHtml(sp.tensanpham || 'Sản phẩm')}</td>
                <td>${escapeHtml(phanloai || 'N/A')}</td>
                <td>${formatCurrency(sp.dongia)}</td>
                <td>${Number(sp.soluong) || 0}</td>
                <td>${formatCurrency(sp.thanhtien)}</td>
            </tr>
        `;
    }).join('');
}

function renderNextAction(order) {
    const btn = document.getElementById('btn-next-status');
    if (!btn) return;

    const nextStatus = order.trangthai_tiep_theo || layTrangThaiTiepTheo(order.trangthai);
    if (!nextStatus || order.trangthai === 'dahuy') {
        btn.style.display = 'none';
        return;
    }

    btn.style.display = '';
    btn.textContent = `Chuyển sang ${getStatusText(nextStatus)}`;
    btn.setAttribute('data-next-status', nextStatus);
}

async function loadOrder() {
    const id = Number(getQuery('id'));
    if (!id) {
        window.location.href = './donhang_list.html';
        return;
    }

    try {
        const res = await adminApi.get(`/donhang/${id}`);
        if (!res.success || !res.data) {
            alert(res.message || 'Không tìm thấy đơn hàng');
            window.location.href = './donhang_list.html';
            return;
        }

        currentOrder = res.data;
        renderInfo(currentOrder);
        renderProgress(currentOrder);
        renderProducts(currentOrder);
        renderNextAction(currentOrder);
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
        window.location.href = './donhang_list.html';
    }
}

async function onClickNextStatus() {
    const btn = document.getElementById('btn-next-status');
    if (!btn || !currentOrder) return;
    const trangthai = btn.getAttribute('data-next-status');
    if (!trangthai) return;

    const ok = window.confirm(`Xác nhận chuyển sang ${getStatusText(trangthai)}?`);
    if (!ok) return;

    btn.disabled = true;

    try {
        const res = await adminApi.patch(`/donhang/${Number(currentOrder.donhang_id)}/trangthai`, { trangthai });
        if (!res.success) {
            alert(res.message || 'Không thể cập nhật trạng thái');
            return;
        }
        await loadOrder();
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    } finally {
        btn.disabled = false;
    }
}

function bindEvents() {
    document.getElementById('btn-next-status')?.addEventListener('click', onClickNextStatus);
}

async function init() {
    bindEvents();
    await loadOrder();
}

document.addEventListener('DOMContentLoaded', init);
