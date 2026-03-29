async function submitDanhMuc(event) {
    event.preventDefault();

    const tendanhmuc = document.getElementById('tendanhmuc')?.value?.trim() || '';
    const mota = document.getElementById('mota')?.value?.trim() || '';

    try {
        const res = await adminApi.post('/danhmuc', { tendanhmuc, mota });
        if (!res.success) {
            alert(res.message || 'Thêm danh mục that bai');
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

document.addEventListener('DOMContentLoaded', bindEvents);
