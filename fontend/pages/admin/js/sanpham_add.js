async function loadDanhMuc() {
    const select = document.getElementById('danhmuc_id');
    if (!select) return;

    try {
        const res = await adminApi.get('/danhmuc');
        const rows = res.success && Array.isArray(res.data?.danhsach) ? res.data.danhsach : [];
        select.innerHTML = rows.map((row) => `<option value="${Number(row.danhmuc_id) || 0}">${escapeHtml(row.tendanhmuc)}</option>`).join('');
    } catch (error) {
        select.innerHTML = '';
    }
}

async function submitSanPham(event) {
    event.preventDefault();

    const payload = {
        tensanpham: document.getElementById('tensanpham')?.value?.trim() || '',
        danhmuc_id: Number(document.getElementById('danhmuc_id')?.value || 0),
        thuonghieu: document.getElementById('thuonghieu')?.value?.trim() || '',
        mota: document.getElementById('mota')?.value?.trim() || '',
        giaban: Number(document.getElementById('giaban')?.value || 0),
        giakhuyenmai: document.getElementById('giakhuyenmai')?.value?.trim() || null,
        hinhanh: document.getElementById('hinhanh')?.value?.trim() || '',
        soluong: Number(document.getElementById('soluong')?.value || 0),
        an_hien: document.getElementById('an_hien')?.checked ? 1 : 0
    };

    try {
        const res = await adminApi.post('/sanpham', payload);
        if (!res.success) {
            alert(res.message || 'Thêm sản phẩm that bai');
            return;
        }
        window.location.href = './sanpham_list.html';
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    }
}

function bindEvents() {
    document.getElementById('sanpham-form')?.addEventListener('submit', submitSanPham);
}

async function init() {
    await loadDanhMuc();
    bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
