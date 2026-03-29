function getTrangThaiTonKho(tonkho) {
    const value = Number(tonkho) || 0;
    if (value <= 0) return 'Hết hàng';
    if (value < 20) return 'Sắp hết';
    return 'Còn hàng';
}

function renderTable(rows) {
    const tbody = document.getElementById('tonkho-table-body');
    if (!tbody) return;

    if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map((row, index) => {
        const tonkho = Number(row.tonkho) || 0;
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(row.tensanpham)}</td>
                <td>${escapeHtml(row.tendanhmuc || 'N/A')}</td>
                <td>${tonkho}</td>
                <td>${getTrangThaiTonKho(tonkho)}</td>
            </tr>
        `;
    }).join('');
}

function renderStats(thongke) {
    document.getElementById('stats-total').textContent = String(Number(thongke.total) || 0);
    document.getElementById('stats-hethang').textContent = String(Number(thongke.hethang) || 0);
    document.getElementById('stats-saphet').textContent = String(Number(thongke.saphet) || 0);
    document.getElementById('stats-conhang').textContent = String(Number(thongke.conhang) || 0);
}

function bindForm() {
    const form = document.getElementById('filter-form');
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const keyword = document.getElementById('keyword')?.value?.trim() || '';
        const order = document.getElementById('order')?.value || 'asc';
        const status = document.getElementById('status')?.value || '';
        setQuery({ keyword, order, status });
    });
}

function fillFormFromQuery() {
    const keyword = getQuery('keyword');
    const order = getQuery('order') || 'asc';
    const status = getQuery('status');

    document.getElementById('keyword').value = keyword;
    document.getElementById('order').value = order;
    document.getElementById('status').value = status;
}

async function loadTonKho() {
    const keyword = getQuery('keyword');
    const order = getQuery('order') || 'asc';
    const status = getQuery('status');

    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (order) params.set('order', order);
    if (status) params.set('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';

    try {
        const res = await adminApi.get(`/tonkho${query}`);
        if (!res.success) {
            renderTable([]);
            renderStats({});
            return;
        }

        const payload = res.data || {};
        const rows = Array.isArray(payload.danhsach) ? payload.danhsach : [];
        const thongke = payload.thongke || {};
        renderTable(rows);
        renderStats(thongke);
    } catch (error) {
        renderTable([]);
        renderStats({});
    }
}

async function init() {
    bindForm();
    fillFormFromQuery();
    await loadTonKho();
}

document.addEventListener('DOMContentLoaded', init);
