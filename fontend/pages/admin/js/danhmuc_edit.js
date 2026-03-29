let currentId = 0;

async function loadDanhMuc() {
    currentId = Number(getQuery('id'));
    if (!currentId) {
        window.location.href = './danhmuc_list.html';
        return;
    }

    try {
        const res = await adminApi.get(`/danhmuc/${currentId}`);
        if (!res.success || !res.data) {
            alert(res.message || 'Không tìm thấy danh mục');
            window.location.href = './danhmuc_list.html';
            return;
        }

        document.getElementById('tendanhmuc').value = res.data.tendanhmuc || '';
        document.getElementById('mota').value = res.data.mota || '';
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
        window.location.href = './danhmuc_list.html';
    }
}

async function submitDanhMuc(event) {
    event.preventDefault();

    const tendanhmuc = document.getElementById('tendanhmuc')?.value?.trim() || '';
    const mota = document.getElementById('mota')?.value?.trim() || '';

    try {
        const res = await adminApi.put(`/danhmuc/${currentId}`, { tendanhmuc, mota });
        if (!res.success) {
            alert(res.message || 'Cập nhật danh mục thất bại');
            return;
        }
        window.location.href = './danhmuc_list.html';
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    }
}

function bindEvents() {
    document.getElementById('danhmuc-form')?.addEventListener('submit', submitDanhMuc);
}

async function init() {
    bindEvents();
    await loadDanhMuc();
}

document.addEventListener('DOMContentLoaded', init);
