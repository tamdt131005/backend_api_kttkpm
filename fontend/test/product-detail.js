
const sanphamData = window.sanphamData || {};
const anhtheomau = sanphamData.anhtheomau || {};
const tonkhotheobienthe = sanphamData.tonkhotheobienthe || {};
const duongdananh = sanphamData.duongdananh || '';
const hasVariants = sanphamData.hasVariants || false;
const soluongSanPham = sanphamData.soluong || 0;

const colorSelect = document.getElementById('select-color');
if (colorSelect) {
    colorSelect.addEventListener('change', function () {
        const mau = this.value;
        if (anhtheomau[mau]) {
            document.getElementById('product-image').src = duongdananh + anhtheomau[mau];
        }
        capNhatSelectSize();
        capNhatTonKho();
    });
}

const sizeSelect = document.getElementById('select-size');
if (sizeSelect) {
    sizeSelect.addEventListener('change', function () {
        capNhatTonKho();
    });
}

function capNhatSelectSize() {
    const sizeSelect = document.getElementById('select-size');
    if (!sizeSelect) return;

    const mauChon = document.getElementById('select-color')?.value || '';
    const allOptions = sizeSelect.querySelectorAll('option');
    let firstAvailable = null;

    allOptions.forEach(option => {
        const size = option.value;
        const key = mauChon + '|' + size;
        const coHang = tonkhotheobienthe.hasOwnProperty(key) && tonkhotheobienthe[key] > 0;

        if (coHang) {
            option.disabled = false;
            option.style.display = '';
            if (!firstAvailable) firstAvailable = option.value;
        } else {
            option.disabled = true;
            option.style.display = 'none';
        }
    });

    const currentSize = sizeSelect.value;
    const currentKey = mauChon + '|' + currentSize;
    if (!tonkhotheobienthe[currentKey] || tonkhotheobienthe[currentKey] <= 0) {
        if (firstAvailable) {
            sizeSelect.value = firstAvailable;
        }
    }
}

function layTonKhoHienTai() {
    if (!hasVariants) return soluongSanPham;

    const mauChon = document.getElementById('select-color')?.value || '';
    const sizeChon = document.getElementById('select-size')?.value || '';
    const key = mauChon + '|' + sizeChon;
    return tonkhotheobienthe[key] || 0;
}

function capNhatTonKho() {
    const tonkho = layTonKhoHienTai();
    const stockDisplay = document.getElementById('stock-display');
    const qtyInput = document.getElementById('quantity-input');

    if (qtyInput) {
        qtyInput.max = tonkho;
        if (parseInt(qtyInput.value) > tonkho) {
            qtyInput.value = tonkho > 0 ? 1 : 0;
        }
    }

    if (!stockDisplay) return;

    if (tonkho > 0) {
        if (tonkho <= 5) {
            stockDisplay.innerHTML = `
                <span class="stock-low">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span class="stock-text">Chỉ còn ${tonkho} sản phẩm</span>
                </span>`;
        } else {
            stockDisplay.innerHTML = `
                <span class="stock-available">
                    <i class="fas fa-check-circle"></i>
                    <span class="stock-text">Còn ${tonkho} sản phẩm</span>
                </span>`;
        }
    } else {
        stockDisplay.innerHTML = `
            <span class="stock-out">
                <i class="fas fa-times-circle"></i>
                <span class="stock-text">Hết hàng</span>
            </span>`;
    }
}

document.getElementById('btn-giam')?.addEventListener('click', function () {
    const input = document.getElementById('quantity-input');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
});

document.getElementById('btn-tang')?.addEventListener('click', function () {
    const input = document.getElementById('quantity-input');
    const max = parseInt(input.max);
    if (parseInt(input.value) < max) {
        input.value = parseInt(input.value) + 1;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (hasVariants && Object.keys(tonkhotheobienthe).length > 0) {
        capNhatSelectSize();
        capNhatTonKho();
    } else if (!hasVariants) {
        capNhatTonKho();
    }
});
