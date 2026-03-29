function renderTable(rows) {
    const tbody = document.getElementById('danhmuc-table-body');
    if (!tbody) return;

    if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map((row) => {
        return `
            <tr>
                <td>${Number(row.danhmuc_id) || 0}</td>
                <td>${escapeHtml(row.tendanhmuc)}</td>
                <td>${escapeHtml(row.slug || '')}</td>
                <td>${Number(row.sosanpham) || 0}</td>
                <td class="actions">
                    <a class="btn btn-small" href="./danhmuc_edit.html?id=${Number(row.danhmuc_id) || 0}">Sửa</a>
                    <button class="btn btn-small btn-danger" data-delete-id="${Number(row.danhmuc_id) || 0}">Xóa</button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderStats(thongke) {
    document.getElementById('stats-total').textContent = String(Number(thongke.total) || 0);
}

async function loadDanhMuc() {
    const keyword = getQuery('keyword');
    const keywordInput = document.getElementById('keyword');
    if (keywordInput) keywordInput.value = keyword;

    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';

    try {
        const res = await adminApi.get(`/danhmuc${query}`);
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

async function deleteDanhMuc(id) {
    const ok = window.confirm('Bạn có chắc muốn xóa danh mục?');
    if (!ok) return;

    try {
        const res = await adminApi.delete(`/danhmuc/${id}`);
        if (!res.success) {
            alert(res.message || 'Không thể xóa danh mục');
            return;
        }
        await loadDanhMuc();
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

    document.getElementById('danhmuc-table-body')?.addEventListener('click', async (event) => {
        const btn = event.target.closest('[data-delete-id]');
        if (!btn) return;
        const id = Number(btn.getAttribute('data-delete-id'));
        if (!id) return;
        await deleteDanhMuc(id);
    });
}

async function init() {
    bindEvents();
    await loadDanhMuc();
}

document.addEventListener('DOMContentLoaded', init);
