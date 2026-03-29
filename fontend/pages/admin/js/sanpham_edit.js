let currentId = 0;

async function loadDanhMuc(selectedId) {
    const select = document.getElementById('danhmuc_id');
    if (!select) return;

    try {
        const res = await adminApi.get('/danhmuc');
        const rows = res.success && Array.isArray(res.data?.danhsach) ? res.data.danhsach : [];
        select.innerHTML = rows.map((row) => {
            const id = Number(row.danhmuc_id) || 0;
            const selected = id === Number(selectedId) ? 'selected' : '';
            return `<option value="${id}" ${selected}>${escapeHtml(row.tendanhmuc)}</option>`;
        }).join('');
    } catch (error) {
        select.innerHTML = '';
    }
}

async function loadSanPham() {
    currentId = Number(getQuery('id'));
    if (!currentId) {
        window.location.href = './sanpham_list.html';
        return;
    }

    try {
        const res = await adminApi.get(`/sanpham/${currentId}`);
        if (!res.success || !res.data) {
            alert(res.message || 'Không tìm thấy sản phẩm');
            window.location.href = './sanpham_list.html';
            return;
        }

        const sp = res.data;
        await loadDanhMuc(sp.danhmuc_id);

        document.getElementById('tensanpham').value = sp.tensanpham || '';
        document.getElementById('thuonghieu').value = sp.thuonghieu || '';
        document.getElementById('giaban').value = Number(sp.giaban) || 0;
        document.getElementById('giakhuyenmai').value = sp.giakhuyenmai === null ? '' : Number(sp.giakhuyenmai) || 0;
        document.getElementById('hinhanh').value = sp.hinhanh || '';
        document.getElementById('soluong').value = Number(sp.soluong) || 0;
        document.getElementById('mota').value = sp.mota || '';
        document.getElementById('an_hien').checked = Number(sp.an_hien) === 1;
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
        window.location.href = './sanpham_list.html';
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
        const res = await adminApi.put(`/sanpham/${currentId}`, payload);
        if (!res.success) {
            alert(res.message || 'Cập nhật sản phẩm thất bại');
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
    bindEvents();
    await loadSanPham();
}

document.addEventListener('DOMContentLoaded', init);
