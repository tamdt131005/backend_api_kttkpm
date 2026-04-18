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

function taoUrlXemTruocAnh(hinhanh) {
    const value = String(hinhanh || '').trim();
    if (!value) return '';

    if (typeof imageUtil !== 'undefined' && imageUtil.product) {
        return imageUtil.product(value);
    }

    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('product/')) return `http://localhost:3000/upload/img/${value}`;
    return `http://localhost:3000/upload/img/product/${value}`;
}

function renderPreview(hinhanh) {
    const preview = document.getElementById('hinhanh-preview');
    if (!preview) return;

    const previewUrl = taoUrlXemTruocAnh(hinhanh);
    if (!previewUrl) {
        preview.style.display = 'none';
        preview.removeAttribute('src');
        return;
    }

    preview.style.display = 'block';
    preview.src = previewUrl;
}

async function uploadHinhAnh() {
    const fileInput = document.getElementById('hinhanh_file');
    const file = fileInput?.files?.[0];
    if (!file) {
        alert('Vui lòng chọn ảnh cần tải lên');
        return;
    }

    if (!String(file.type || '').startsWith('image/')) {
        alert('File tải lên phải là ảnh');
        return;
    }

    if (Number(file.size || 0) > 2 * 1024 * 1024) {
        alert('Ảnh vượt quá 2MB');
        return;
    }

    const btnUpload = document.getElementById('btn-upload-hinhanh');
    if (btnUpload) btnUpload.disabled = true;

    try {
        const formData = new FormData();
        formData.append('hinhanh', file);

        const res = await adminApi.upload('/sanpham/upload-anh', formData);
        if (!res.success) {
            alert(res.message || 'Upload ảnh thất bại');
            return;
        }

        const hinhanh = String(res.data?.hinhanh || '').trim();
        const inputHinhAnh = document.getElementById('hinhanh');
        if (inputHinhAnh) {
            inputHinhAnh.value = hinhanh;
        }
        renderPreview(hinhanh);
        alert('Upload ảnh thành công');
    } catch (error) {
        alert('Lỗi kết nối máy chủ khi upload ảnh');
    } finally {
        if (btnUpload) btnUpload.disabled = false;
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
    document.getElementById('btn-upload-hinhanh')?.addEventListener('click', uploadHinhAnh);
    document.getElementById('hinhanh')?.addEventListener('input', (event) => {
        renderPreview(event.target.value || '');
    });
}

async function init() {
    await loadDanhMuc();
    bindEvents();
    renderPreview(document.getElementById('hinhanh')?.value || '');
}

document.addEventListener('DOMContentLoaded', init);
