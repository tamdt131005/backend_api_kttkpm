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

function renderTable(rows) {
    const tbody = document.getElementById('nhaphang-table-body');
    if (!tbody) return;
    if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map((row) => {
        const phanLoai = [row.kichthuoc, row.mausac].filter(Boolean).join(' - ');
        return `
            <tr>
                <td>#${Number(row.phieunhap_id) || 0}</td>
                <td>${formatDate(row.ngaynhap)}</td>
                <td>${escapeHtml(row.tensanpham)}</td>
                <td>${escapeHtml(phanLoai || 'N/A')}</td>
                <td>${Number(row.soluong) || 0}</td>
                <td>${formatCurrency(row.dongia)}</td>
                <td>${formatCurrency(row.thanhtien)}</td>
                <td>${escapeHtml(row.ghichu || row.ghichu_phieu || '')}</td>
            </tr>
        `;
    }).join('');
}

function renderStats(rows, tongSoLuong, tongTien) {
    const countEl = document.getElementById('stats-count');
    const soLuongEl = document.getElementById('stats-soluong');
    const tongTienEl = document.getElementById('stats-tongtien');

    if (countEl) countEl.textContent = String(rows.length);
    if (soLuongEl) soLuongEl.textContent = String(Number(tongSoLuong) || 0);
    if (tongTienEl) tongTienEl.textContent = formatCurrency(tongTien);
}

async function loadDanhSachNhapHang() {
    const keyword = getQuery('keyword');
    const keywordInput = document.getElementById('keyword');
    if (keywordInput) keywordInput.value = keyword;

    try {
        const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
        const res = await adminApi.get(`/nhaphang${query}`);

        if (!res.success) {
            renderTable([]);
            renderStats([], 0, 0);
            return;
        }

        const payload = res.data || {};
        const rows = Array.isArray(payload.data) ? payload.data : [];
        const tongSoLuong = Number(payload.tongSoLuong) || 0;
        const tongTien = Number(payload.tongTien) || 0;

        renderTable(rows);
        renderStats(rows, tongSoLuong, tongTien);
    } catch (error) {
        renderTable([]);
        renderStats([], 0, 0);
    }
}

function bindForm() {
    const form = document.getElementById('search-form');
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const keyword = document.getElementById('keyword')?.value?.trim() || '';
        setQuery({ keyword });
    });
}

async function init() {
    renderMessage();
    bindForm();
    await loadDanhSachNhapHang();
}

document.addEventListener('DOMContentLoaded', init);
