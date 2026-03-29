let danhSachBienThe = [];

function renderBienTheOptions() {
    const datalist = document.getElementById('ds_bienthe');
    if (!datalist) return;
    datalist.innerHTML = danhSachBienThe.map((bt) => {
        return `<option value="${escapeHtml(bt.tenbienthe)}" data-id="${Number(bt.bienthe_id) || 0}"></option>`;
    }).join('');
}

async function loadDanhSachBienThe() {
    try {
        const res = await adminApi.get('/bienthe');
        if (!res.success) {
            danhSachBienThe = [];
            renderBienTheOptions();
            return;
        }
        danhSachBienThe = Array.isArray(res.data) ? res.data : [];
        renderBienTheOptions();
    } catch (error) {
        danhSachBienThe = [];
        renderBienTheOptions();
    }
}

function ganSuKienTimSanPham(row) {
    const input = row.querySelector('input[list]');
    const hidden = row.querySelector('input[type="hidden"]');
    if (!input || !hidden) return;

    input.addEventListener('change', function () {
        hidden.value = '';
        const matched = danhSachBienThe.find((item) => item.tenbienthe === this.value);
        if (matched) {
            hidden.value = String(Number(matched.bienthe_id) || 0);
        }
    });
}

function capNhatSTT() {
    const rows = document.querySelectorAll('#tableBody tr:not(#dongMau)');
    rows.forEach((row, index) => {
        const stt = row.querySelector('.row-number');
        if (stt) stt.textContent = String(index + 1);
    });
}

function themDong() {
    const tableBody = document.getElementById('tableBody');
    const dongMau = document.getElementById('dongMau');
    if (!tableBody || !dongMau) return;

    const dongMoi = dongMau.cloneNode(true);
    dongMoi.removeAttribute('id');
    dongMoi.classList.remove('hidden-row');
    dongMoi.querySelectorAll('input').forEach((input) => {
        input.value = '';
    });

    tableBody.appendChild(dongMoi);
    ganSuKienTimSanPham(dongMoi);
    capNhatSTT();

    const firstInput = dongMoi.querySelector('input[list]');
    if (firstInput) firstInput.focus();
}

function xoaDong(btn) {
    const row = btn.closest('tr');
    const tableBody = document.getElementById('tableBody');
    if (!row || !tableBody) return;

    const visibleRows = tableBody.querySelectorAll('tr:not(#dongMau)');
    if (visibleRows.length <= 1) {
        alert('Phải có ít nhất 1 dòng dữ liệu');
        return;
    }

    row.remove();
    capNhatSTT();
}

function getRowsPayload() {
    const rows = Array.from(document.querySelectorAll('#tableBody tr:not(#dongMau)'));
    return rows.map((row) => {
        return {
            tenbienthe: row.querySelector('input[name="tenbienthe[]"]')?.value?.trim() || '',
            bienthe_id: row.querySelector('input[name="bienthe_id[]"]')?.value?.trim() || '',
            soluong: row.querySelector('input[name="soluong[]"]')?.value?.trim() || '',
            dongia: row.querySelector('input[name="dongia[]"]')?.value?.trim() || '',
            ghichu: row.querySelector('input[name="ghichu[]"]')?.value?.trim() || ''
        };
    });
}

async function submitPhiếuNhap(event) {
    event.preventDefault();
    const btn = document.getElementById('btnLuu');
    if (btn) btn.disabled = true;

    const payload = {
        ghichu_phieu: document.getElementById('ghichu_phieu')?.value?.trim() || '',
        rows: getRowsPayload()
    };

    try {
        const res = await adminApi.post('/nhaphang', payload);
        if (!res.success) {
            alert(res.message || 'Thêm phiếu nhập that bai');
            return;
        }

        const id = Number(res.data?.phieunhap_id) || 0;
        const text = encodeURIComponent(`Đã lưu phiếu nhập #${id}`);
        window.location.href = `./nhaphang_list.html?msg=success&text=${text}`;
    } catch (error) {
        alert('Lỗi kết nối máy chủ');
    } finally {
        if (btn) btn.disabled = false;
    }
}

function bindEvents() {
    document.getElementById('btnThemDong')?.addEventListener('click', themDong);
    document.getElementById('formNhaphang')?.addEventListener('submit', submitPhiếuNhap);
}

async function init() {
    await loadDanhSachBienThe();
    bindEvents();
    themDong();
}

document.addEventListener('DOMContentLoaded', init);

window.themDong = themDong;
window.xoaDong = xoaDong;
