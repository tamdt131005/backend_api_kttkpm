function renderMessage() {
    const type = getQuery('msg');
    const text = getQuery('text');
    const message = document.getElementById('page-message');
    if (!message) return;
    if (!type || !text) {
        message.textContent = '';
        message.className = 'message';
        return;
    }
    message.textContent = decodeURIComponent(text);
    message.className = type === 'success' ? 'message success' : 'message error';
}

function getCurrentStatus() {
    return document.body.dataset.status || 'all';
}

function highlightStatusTab() {
    const status = getCurrentStatus();
    document.querySelectorAll('[data-status-link]').forEach((link) => {
        if (link.getAttribute('data-status-link') === status) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function renderStats(thongke, tongdoanhthu) {
    const setStatText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setStatText('stats-tatca', String(Number(thongke.tatca) || 0));
    setStatText('stats-choxacnhan', String(Number(thongke.choxacnhan) || 0));
    setStatText('stats-dangxuly', String(Number(thongke.dangxuly) || 0));
    setStatText('stats-danggiao', String(Number(thongke.danggiao) || 0));
    setStatText('stats-dagiao', String(Number(thongke.dagiao) || 0));
    setStatText('stats-dahuy', String(Number(thongke.dahuy) || 0));
    setStatText('stats-doanhthu', formatCurrency(tongdoanhthu));
}

function renderActions(row) {
    const nextStatus = layTrangThaiTiepTheo(row.trangthai);
    const detail = `<a class="btn btn-small" href="./donhang_detail.html?id=${Number(row.donhang_id) || 0}">Chi tiết</a>`;
    if (!nextStatus || row.trangthai === 'dahuy') {
        return detail;
    }
    return `${detail}<button class="btn btn-small btn-primary" data-next-id="${Number(row.donhang_id) || 0}" data-next-status="${nextStatus}">Chuyển sang ${getStatusText(nextStatus)}</button>`;
}

function renderTable(rows) {
    const tbody = document.getElementById('donhang-table-body');
    if (!tbody) return;

    if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">Không có đơn hàng</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map((row) => {
        return `
            <tr>
                <td>${escapeHtml(row.ma_donhang || `DH${row.donhang_id}`)}</td>
                <td>
                    <div>${escapeHtml(row.ten_khachhang || 'N/A')}</div>
                    <small>${escapeHtml(row.sdt_khachhang || '')}</small>
                </td>
                <td>${escapeHtml(getStatusText(row.trangthai))}</td>
                <td>${escapeHtml(getPaymentStatusText(row.trangthaithanhtoan))}</td>
                <td>${formatCurrency(row.tongthanhtoan)}</td>
                <td>${formatDate(row.ngaytao)}</td>
                <td class="actions">${renderActions(row)}</td>
            </tr>
        `;
    }).join('');
}

async function loadDonHang() {
    const status = getCurrentStatus();
    const keyword = getQuery('keyword');
    const keywordInput = document.getElementById('keyword');
    if (keywordInput) keywordInput.value = keyword;

    const params = new URLSearchParams();
    if (status) params.set('trangthai', status);
    if (keyword) params.set('keyword', keyword);

    try {
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await adminApi.get(`/donhang${query}`);

        if (!res.success) {
            renderTable([]);
            renderStats({}, 0);
            return;
        }

        const payload = res.data || {};
        const rows = Array.isArray(payload.danhsach) ? payload.danhsach : [];
        const thongke = payload.thongke || {};
        const tongdoanhthu = Number(payload.tongdoanhthu) || 0;

        renderTable(rows);
        renderStats(thongke, tongdoanhthu);
    } catch (error) {
        renderTable([]);
        renderStats({}, 0);
    }
}

async function capNhatTrangThai(donhangId, trangthai) {
    try {
        const res = await adminApi.patch(`/donhang/${donhangId}/trangthai`, { trangthai });
        if (!res.success) {
            alert(res.message || 'Không thể cập nhật trạng thái');
            return;
        }
        await loadDonHang();
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    }
}

function bindEvents() {
    document.getElementById('search-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const keyword = document.getElementById('keyword')?.value?.trim() || '';
        setQuery({ keyword });
    });

    document.getElementById('donhang-table-body')?.addEventListener('click', async (event) => {
        const btn = event.target.closest('[data-next-id]');
        if (!btn) return;
        const donhangId = Number(btn.getAttribute('data-next-id'));
        const trangthai = btn.getAttribute('data-next-status') || '';
        if (!donhangId || !trangthai) return;
        const ok = window.confirm(`Xác nhận chuyển đơn #${donhangId} sang ${getStatusText(trangthai)}?`);
        if (!ok) return;
        await capNhatTrangThai(donhangId, trangthai);
    });
}

async function init() {
    renderMessage();
    highlightStatusTab();
    bindEvents();
    await loadDonHang();
}

document.addEventListener('DOMContentLoaded', init);
