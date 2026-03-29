const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

const $ = (id) => document.getElementById(id);
const FRONTEND_BASE_PATH = window.location.pathname.includes('/fontend/') ? '/fontend' : '';
const withFrontendBase = (path) => `${FRONTEND_BASE_PATH}${path}`;

let bienthe = [];
let selectedColor = null;
let selectedSize = null;
let currentProduct = null;

function formatTien(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);
}
function hienThiImg(hinhanh) {
    $("main-image").src = hinhanh;
}

function hienThiSaoDanhGia(value) {
    const rounded = Math.round(value);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<i class="fas fa-star${i <= rounded ? '' : ' empty'}"></i>`;
    }
    return html;
}

function getsize(color) {
    return bienthe.filter(bt => bt.mausac === color).map(bt => bt.kichthuoc);
}

function getBientheTheoMau(color) {
    return bienthe.filter(bt => bt.mausac === color);
}

function getBienTheDangChon() {
    return bienthe.find((bt) => {
        const dungMau = bt.mausac === selectedColor;
        const dungSize = String(bt.kichthuoc) === String(selectedSize);
        return dungMau && dungSize;
    }) || null;
}

function capNhatTrangThaiNutMua() {
    const addBtn = $("add-to-cart");
    const buyBtn = $("buy-now");
    if (!addBtn || !buyBtn) return;

    const bientheDangChon = getBienTheDangChon();

    if (bienthe.length > 0 && !bientheDangChon) {
        addBtn.disabled = true;
        buyBtn.disabled = true;
        addBtn.innerHTML = '<i class="fas fa-list-check"></i> Chọn phân loại';
        return;
    }

    const tonKho = bientheDangChon
        ? Math.max(Number(bientheDangChon.soluong) || 0, 0)
        : Math.max(Number(currentProduct?.tong_soluong) || 0, 0);

    if (tonKho === 0) {
        addBtn.disabled = true;
        buyBtn.disabled = true;
        addBtn.innerHTML = '<i class="fas fa-ban"></i> Hết hàng';
        return;
    }

    addBtn.disabled = false;
    buyBtn.disabled = false;
    addBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Thêm vào giỏ';
}

function capNhatSoLuongTheoBienThe() {
    const quantityInput = $("quantity");
    const quantityLabel = document.querySelector('label[for="quantity"]');
    if (!quantityInput || !quantityLabel) return;

    const bientheDangChon = getBienTheDangChon();

    if (bienthe.length > 0 && !bientheDangChon) {
        quantityLabel.textContent = 'Số lượng:';
        quantityInput.min = '1';
        quantityInput.max = '1';
        quantityInput.value = '1';
        quantityInput.disabled = true;
        capNhatTrangThaiNutMua();
        return;
    }

    const tonKho = bientheDangChon
        ? Math.max(Number(bientheDangChon.soluong) || 0, 0)
        : Math.max(Number(currentProduct?.tong_soluong) || 0, 0);

    quantityLabel.textContent = `Số lượng (còn ${tonKho}):`;

    if (tonKho === 0) {
        quantityInput.min = '0';
        quantityInput.max = '0';
        quantityInput.value = '0';
        quantityInput.disabled = true;
        capNhatTrangThaiNutMua();
        return;
    }

    quantityInput.min = '1';
    quantityInput.max = String(tonKho);
    const currentValue = Number(quantityInput.value) || 1;
    quantityInput.value = String(Math.min(Math.max(currentValue, 1), tonKho));
    quantityInput.disabled = false;
    capNhatTrangThaiNutMua();
}

function rangBuocNhapSoLuong() {
    const quantityInput = $("quantity");
    if (!quantityInput || quantityInput.disabled) return;

    const min = Number(quantityInput.min) || 1;
    const max = Number(quantityInput.max) || min;
    const value = Number(quantityInput.value) || min;

    quantityInput.value = String(Math.min(Math.max(value, min), max));
}

function ganSuKienNhapSoLuong() {
    const quantityInput = $("quantity");
    if (!quantityInput || quantityInput.dataset.bound === '1') return;

    quantityInput.addEventListener('input', rangBuocNhapSoLuong);
    quantityInput.addEventListener('change', rangBuocNhapSoLuong);
    quantityInput.dataset.bound = '1';
}

function hienthiSizeTheoMau(color) {
    const sizeWrap = $("product-size");
    const sizeContainer = $("chonsize");
    if (!sizeWrap || !sizeContainer) return;

    const allSizes = [...new Set(bienthe.map(bt => bt.kichthuoc).filter(Boolean))];
    if (allSizes.length === 0) {
        sizeWrap.style.display = 'none';
        sizeContainer.innerHTML = '';
        selectedSize = null;
        capNhatSoLuongTheoBienThe();
        return;
    }

    const bientheTheoMau = getBientheTheoMau(color);
    const existingSizeSet = new Set(bientheTheoMau.map(bt => String(bt.kichthuoc)));
    const inStockSizeSet = new Set(
        bientheTheoMau
            .filter(bt => Number(bt.soluong) > 0)
            .map(bt => String(bt.kichthuoc))
    );

    if (!selectedSize || !existingSizeSet.has(String(selectedSize))) {
        selectedSize = bientheTheoMau[0]?.kichthuoc || null;
    }

    if (selectedSize && !inStockSizeSet.has(String(selectedSize)) && inStockSizeSet.size > 0) {
        selectedSize = [...inStockSizeSet][0];
    }

    sizeWrap.style.display = '';
    sizeContainer.innerHTML = allSizes
        .map(size => {
            const key = String(size);
            const variant = bientheTheoMau.find(bt => String(bt.kichthuoc) === key);
            const khongTonTai = !variant;
            const hetHang = !!variant && Number(variant.soluong) <= 0;
            const isDisabled = khongTonTai || hetHang;
            const isActive = !khongTonTai && String(selectedSize) === key;
            const tooltip = khongTonTai
                ? 'Không có ở màu này'
                : (hetHang ? 'Hết hàng' : `Còn ${Math.max(Number(variant.soluong) || 0, 0)} sản phẩm`);

            return `<button class="bienthe-size ${isActive ? 'active' : ''}" data-size="${size}" ${isDisabled ? 'disabled' : ''} title="${tooltip}">${size}</button>`;
        })
        .join('');

    const sizeButtons = sizeContainer.querySelectorAll('.bienthe-size');
    sizeButtons.forEach((btn) => {
        if (btn.disabled) return;
        btn.addEventListener('click', () => {
            sizeButtons.forEach(item => item.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.dataset.size;
            capNhatSoLuongTheoBienThe();
        });
    });

    capNhatSoLuongTheoBienThe();
}

function hienthiMau() {
    const colorWrap = $("product-color");
    const colorContainer = $("chonmau");
    if (!colorWrap || !colorContainer) return;

    const colors = [...new Set(bienthe.map(bt => bt.mausac).filter(Boolean))];
    if (colors.length === 0) {
        colorWrap.style.display = 'none';
        colorContainer.innerHTML = '';
        const sizeWrap = $("product-size");
        const sizeContainer = $("chonsize");
        if (sizeWrap) sizeWrap.style.display = 'none';
        if (sizeContainer) sizeContainer.innerHTML = '';
        selectedColor = null;
        selectedSize = null;
        capNhatSoLuongTheoBienThe();
        return;
    }

    if (!selectedColor || !colors.includes(selectedColor)) {
        selectedColor = colors[0];
    }

    colorWrap.style.display = '';
    colorContainer.innerHTML = colors
        .map(color => `<button class="bienthe-color ${color === selectedColor ? 'active' : ''}" data-color="${color}">${color}</button>`)
        .join('');

    const color_btn = colorContainer.querySelectorAll('.bienthe-color');
    color_btn.forEach((btn) => {
        btn.addEventListener('click', () => {
            color_btn.forEach(item => item.classList.remove('active'));
            btn.classList.add('active');
            selectedColor = btn.dataset.color;
            hienthiSizeTheoMau(selectedColor);
        });
    });

    if (color_btn.length > 0) {
        const mauMacDinh = Array.from(color_btn).find(btn => btn.dataset.color === selectedColor);
        (mauMacDinh || color_btn[0]).click();
    }
}

async function themVaoGio(chuyenCheckout = false) {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        alert('Vui lòng đăng nhập để tiếp tục.');
        window.location.href = withFrontendBase('/pages/auth/login.html');
        return;
    }

    if (!currentProduct?.id) {
        alert('Không tìm thấy thông tin sản phẩm.');
        return;
    }

    const bienTheDangChon = getBienTheDangChon();
    if (bienthe.length > 0 && !bienTheDangChon) {
        alert('Vui lòng chọn màu và kích cỡ hợp lệ.');
        return;
    }

    const quantityInput = $("quantity");
    const soLuong = Math.max(Number(quantityInput?.value) || 1, 1);

    try {
        const res = await api.post('/cart', {
            user_id: Number(userId),
            sanpham_id: currentProduct.id,
            bienthe_id: bienTheDangChon?.id || null,
            soluong: soLuong
        });

        if (!res.success) {
            alert(res.message || 'Không thể thêm vào giỏ hàng.');
            return;
        }

        if (chuyenCheckout) {
            window.location.href = withFrontendBase('/pages/checkout/checkout.html');
        } else {
            alert('Đã thêm vào giỏ hàng thành công.');
        }
    } catch (error) {
        console.error('Lỗi thao tác giỏ hàng:', error);
        alert('Đã xảy ra lỗi, vui lòng thử lại.');
    }
}

function ganSuKienNutMuaHang() {
    const addBtn = $("add-to-cart");
    const buyBtn = $("buy-now");

    if (addBtn) {
        addBtn.onclick = () => {
            themVaoGio(false);
        };
    }

    if (buyBtn) {
        buyBtn.onclick = () => {
            themVaoGio(true);
        };
    }
}

function hienthiThongTinSanPham(product) {
    currentProduct = product || null;

    const categoryLink = $("product-link-danhmuc");
    categoryLink.textContent = product.tendanhmuc || "Danh mục";
    categoryLink.href = product.danhmuc_slug
        ? `${withFrontendBase('/pages/category/index.html')}?slug=${product.danhmuc_slug}`
        : '#';

    const productNameLink = $("product-link-name");
    productNameLink.textContent = product.tensanpham || "Sản phẩm";

    hienThiImg(imageUtil.product(product.hinhanh));
    $("product-name").textContent = product.tensanpham;

    const rating = Number(product.diem_danhgia) || 0;
    const countRating = Number(product.luot_danhgia) || 0;
    if (countRating > 0) {
        $("product-ratting").textContent = Math.round(rating * 10) / 10;
        $("product-star").innerHTML = hienThiSaoDanhGia(product.diem_danhgia);
        $("product-count-rating").textContent = `(${countRating} đánh giá)`;
    } else {
        $("product-ratting").textContent = '0';
        $("product-star").innerHTML = hienThiSaoDanhGia(0);
        $("product-count-rating").textContent = '(0 đánh giá)';
    }

    $("giaban").textContent = formatTien(product.giaban);
    if (product.giakhuyenmai > 0 && product.giakhuyenmai < product.giaban) {
        $("giaban").textContent = formatTien(product.giakhuyenmai);
        $("giagoc").textContent = formatTien(product.giaban);
        $("giagoc").classList.add('gach-chan');
        $("giamgia").textContent = `${Math.round((1 - product.giakhuyenmai / product.giaban) * 100)}% giảm`;
    } else {
        $("giagoc").textContent = '';
        $("giagoc").classList.remove('gach-chan');
        $("giamgia").textContent = '';
    }

    const motaWrap = $("product-mota");
    const motaContent = $("mota-content");
    if (motaWrap && motaContent) {
        if (product.mota) {
            motaContent.innerHTML = product.mota;
            motaWrap.style.display = '';
        } else {
            motaContent.innerHTML = '';
            motaWrap.style.display = 'none';
        }
    }

    bienthe = product.bienthe || [];
    selectedColor = bienthe[0]?.mausac || null;
    selectedSize = bienthe[0]?.kichthuoc || null;

    ganSuKienNhapSoLuong();
    ganSuKienNutMuaHang();
    hienthiMau();
}   


async function init() {
    if (!productId) {
        console.error('Thiếu id sản phẩm trên URL.');
        return;
    }

    try {
        const res = await api.get(`/products/${productId}`);
        if (!res.success || !res.data) {
            throw new Error(res.message || 'Không tìm thấy sản phẩm');
        }

        hienthiThongTinSanPham(res.data);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
    }
}

document.addEventListener('DOMContentLoaded', init);



