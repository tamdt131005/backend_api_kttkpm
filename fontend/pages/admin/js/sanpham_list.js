function renderTable(rows) {
    const tbody = document.getElementById('sanpham-table-body');
    if (!tbody) return;

    if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map((row) => {
        return `
            <tr>
                <td>${Number(row.sanpham_id) || 0}</td>
                <td>${escapeHtml(row.tensanpham || '')}</td>
                <td>${escapeHtml(row.tendanhmuc || 'N/A')}</td>
                <td>${formatCurrency(row.giaban)}</td>
                <td>${Number(row.giakhuyenmai) > 0 ? formatCurrency(row.giakhuyenmai) : 'Không'}</td>
                <td>${Number(row.tonkho) || 0}</td>
                <td class="actions">
                    <a class="btn btn-small" href="./sanpham_edit.html?id=${Number(row.sanpham_id) || 0}">Sửa</a>
                    <button class="btn btn-small btn-danger" data-delete-id="${Number(row.sanpham_id) || 0}">Xóa</button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderStats(thongke) {
    document.getElementById('stats-total').textContent = String(Number(thongke.total) || 0);
    document.getElementById('stats-conhang').textContent = String(Number(thongke.conhang) || 0);
    document.getElementById('stats-hethang').textContent = String(Number(thongke.hethang) || 0);
}

async function loadSanPham() {
    const keyword = getQuery('keyword');
    const keywordInput = document.getElementById('keyword');
    if (keywordInput) keywordInput.value = keyword;

    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';

    try {
        const res = await adminApi.get(`/sanpham${query}`);
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

async function deleteSanPham(id) {
    const ok = window.confirm('Bạn có chắc muốn xóa sản phẩm?');
    if (!ok) return;

    try {
        const res = await adminApi.delete(`/sanpham/${id}`);
        if (!res.success) {
            alert(res.message || 'Không thể xóa sản phẩm');
            return;
        }
        await loadSanPham();
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

    document.getElementById('sanpham-table-body')?.addEventListener('click', async (event) => {
        const btn = event.target.closest('[data-delete-id]');
        if (!btn) return;
        const id = Number(btn.getAttribute('data-delete-id'));
        if (!id) return;
        await deleteSanPham(id);
    });
}

async function init() {
    bindEvents();
    await loadSanPham();
}

document.addEventListener('DOMContentLoaded', init);
