const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

const $ = (id) => document.getElementById(id);

let selectedColor = null;
let selectedSize = null;
let currentBienthe = [];
let currentTotalStock = 0;

function formatTien(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);
}

function hienThiSaoDanhGia(score) {
    const rounded = Math.round(score);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<i class="fas fa-star${i <= rounded ? '' : ' empty'}"></i>`;
    }
    return html;
}

function formatSoluong(n) {
    if (n === 0) return { text: 'Hết hàng', class: 'stock-out', icon: 'fa-times-circle' };
    if (n <= 10) return { text: `Sắp hết (còn ${n})`, class: 'stock-low', icon: 'fa-exclamation-circle' };
    return { text: `Còn ${n} sản phẩm`, class: 'stock-available', icon: 'fa-check-circle' };
}

function getSizesForColor(color) {
    return currentBienthe.filter(v => v.mausac === color);
}

function getVariant(color, size) {
    if (!color && !size) return null;
    return currentBienthe.find(v => 
        (!color || v.mausac === color) && 
        (!size || String(v.kichthuoc) === String(size))
    ) || null;
}

function renderColors() {
    const uniqueColors = [...new Set(currentBienthe.map(v => v.mausac).filter(Boolean))];
    if (uniqueColors.length === 0) return;

    $('group-mausac').style.display = '';
    const container = $('options-mausac');
    container.className = 'variant-buttons';
    
    container.innerHTML = uniqueColors.map(color => `
        <button class="variant-btn color-btn ${selectedColor === color ? 'active' : ''}" 
                onclick="window.selectColor('${color}')" data-color="${color}">
            ${color}
        </button>
    `).join('');
}

function renderSizes(color) {
    const allSizes = [...new Set(currentBienthe.map(v => v.kichthuoc).filter(Boolean))];
    if (allSizes.length === 0) return;

    $('group-kichthuoc').style.display = '';
    const container = $('options-kichthuoc');
    container.className = 'variant-buttons';

    const available = color ? getSizesForColor(color) : currentBienthe;
    const availableKeys = new Set(available.map(v => v.kichthuoc));

    container.innerHTML = allSizes.map(size => {
        const variantInColor = available.find(v => v.kichthuoc === size);
        const outOfStock = variantInColor && variantInColor.soluong === 0;
        const unavailable = color && !availableKeys.has(size);
        const isDisabled = unavailable || outOfStock;
        
        return `
            <button class="variant-btn size-btn ${selectedSize === size ? 'active' : ''}" 
                    ${isDisabled ? 'disabled' : `onclick="window.selectSize('${size}')"`}
                    data-size="${size}"
                    title="${unavailable ? 'Không có màu này' : (outOfStock ? 'Hết hàng' : '')}">
                ${size}
            </button>
        `;
    }).join('');
}

function renderStock(variant) {
    const stockContainer = $('stock-status');

    if (!variant) {
        if (currentBienthe.length > 0 && (!selectedColor || !selectedSize)) {
             stockContainer.innerHTML = `<span style="color:var(--muted)">Vui lòng chọn phân loại hàng</span>`;
             return 0;
        }
        
        const info = formatSoluong(currentTotalStock);
        stockContainer.innerHTML = `<span class="${info.class}"><i class="fas ${info.icon}"></i>${info.text}</span>`;
        return currentTotalStock;
    }

    const info = formatSoluong(variant.soluong);
    stockContainer.innerHTML = `<span class="${info.class}"><i class="fas ${info.icon}"></i>${info.text}</span>`;
    return variant.soluong;
}

function updateActionButtons(availableQty) {
    const btnAddCart = $('btn-add-cart');
    const btnBuyNow = $('btn-buy-now');
    const qtyInput = $('qty-input');
    
    qtyInput.max = availableQty || 1;
    if (parseInt(qtyInput.value) > availableQty) qtyInput.value = availableQty || 1;

    const needsColor = currentBienthe.some(b => b.mausac) && !selectedColor;
    const needsSize = currentBienthe.some(b => b.kichthuoc) && !selectedSize;

    if (needsColor || needsSize) {
        btnAddCart.disabled = true;
        btnBuyNow.disabled = true;
        btnAddCart.innerHTML = '<i class="fas fa-shopping-cart"></i> Chọn phân loại';
    } else if (availableQty === 0) {
        btnAddCart.disabled = true;
        btnBuyNow.disabled = true;
        qtyInput.disabled = true;
        btnAddCart.innerHTML = '<i class="fas fa-shopping-cart"></i> Hết hàng';
    } else {
        btnAddCart.disabled = false;
        btnBuyNow.disabled = false;
        qtyInput.disabled = false;
        btnAddCart.innerHTML = '<i class="fas fa-shopping-cart"></i> Thêm vào giỏ';
    }
}

window.selectColor = function(color) {
    selectedColor = color;
    selectedSize = null;
    
    renderColors();
    renderSizes(color);
    
    const variant = getVariant(selectedColor, selectedSize);
    const availableQty = renderStock(variant);
    updateActionButtons(availableQty);
};

window.selectSize = function(size) {
    selectedSize = size;
    
    renderSizes(selectedColor);
    
    const variant = getVariant(selectedColor, selectedSize);
    const availableQty = renderStock(variant);
    updateActionButtons(availableQty);
};

function renderProduct(product) {
    const giaban = Number(product.giaban) || 0;
    const giakm = Number(product.giakhuyenmai) || 0;
    const coGiam = giakm > 0 && giakm < giaban;
    const phanTram = coGiam ? Math.round((1 - giakm / giaban) * 100) : 0;

    currentBienthe = product.bienthe || [];
    currentTotalStock = Number(product.soluong) || 0;
    selectedColor = null;
    selectedSize = null;

    $('product-name').textContent = product.tensanpham;

    $('breadcrumb-product').textContent = product.tensanpham;
    const catLink = $('breadcrumb-category');
    catLink.textContent = product.tendanhmuc || 'Danh mục';
    catLink.href = product.danhmuc_slug ? `/pages/category/index.html?slug=${product.danhmuc_slug}` : '#';

    $('rating-score').textContent = Number(product.diem_danhgia).toFixed(1);
    $('star-icons').innerHTML = hienThiSaoDanhGia(product.diem_danhgia);
    $('rating-count').textContent = `(${product.luot_danhgia} đánh giá)`;

    if (coGiam) {
        $('price-sale').textContent = formatTien(giakm);
        $('price-original').textContent = formatTien(giaban);
        $('price-original').style.display = '';
        $('price-discount').textContent = `-${phanTram}%`;
        $('price-discount').style.display = '';
        $('discount-badge').textContent = `-${phanTram}%`;
        $('discount-badge').style.display = '';
    } else {
        $('price-sale').textContent = formatTien(giaban);
    }

    const mainImg = $('main-image');
    if (mainImg) {
        mainImg.src = imageUtil.product(product.hinhanh);
        mainImg.alt = product.tensanpham;
    }

    const uniqueColors = [...new Set(currentBienthe.map(v => v.mausac).filter(Boolean))];
    const allSizes = [...new Set(currentBienthe.map(v => v.kichthuoc).filter(Boolean))];
    
    if (uniqueColors.length > 0) {
        selectedColor = uniqueColors[0];
    }
    
    if (selectedColor && allSizes.length > 0) {
         const availableSizesForColor = getSizesForColor(selectedColor).filter(v => v.soluong > 0);
         if (availableSizesForColor.length > 0) {
             selectedSize = availableSizesForColor[0].kichthuoc;
         } else if (allSizes.length > 0) {
              selectedSize = getSizesForColor(selectedColor)[0]?.kichthuoc;
         }
    }

    renderColors();
    renderSizes(selectedColor);

    const variant = getVariant(selectedColor, selectedSize);
    const availableQty = renderStock(variant);
    updateActionButtons(availableQty);

    const qtyInput = $('qty-input');
    
    const btnMinus = $('btn-minus');
    const newBtnMinus = btnMinus.cloneNode(true);
    btnMinus.parentNode.replaceChild(newBtnMinus, btnMinus);
    
    const btnPlus = $('btn-plus');
    const newBtnPlus = btnPlus.cloneNode(true);
    btnPlus.parentNode.replaceChild(newBtnPlus, btnPlus);

    newBtnMinus.addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
    });
    newBtnPlus.addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 1;
        const maxQty = parseInt(qtyInput.max) || 1;
        if (val < maxQty) qtyInput.value = val + 1;
    });

    const btnAddCart = $('btn-add-cart');
    const newBtnAddCart = btnAddCart.cloneNode(true);
    btnAddCart.parentNode.replaceChild(newBtnAddCart, btnAddCart);

    newBtnAddCart.addEventListener('click', async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        const qty = parseInt(qtyInput.value) || 1;
        const variant = getVariant(selectedColor, selectedSize);

        try {
            const res = await api.post('/cart', {
                sanpham_id: product.id,
                bienthe_id: variant?.id || null,
                soluong: qty
            });
            if (res.success) {
                alert('Đã thêm vào giỏ hàng!');
            } else {
                alert(res.message || 'Lỗi thêm giỏ hàng');
            }
        } catch (error) {
            console.error('Lỗi thêm giỏ:', error);
            alert('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    });

    const btnBuyNow = $('btn-buy-now');
    const newBtnBuyNow = btnBuyNow.cloneNode(true);
    btnBuyNow.parentNode.replaceChild(newBtnBuyNow, btnBuyNow);

    newBtnBuyNow.addEventListener('click', async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('Vui lòng đăng nhập để mua hàng');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        const qty = parseInt(qtyInput.value) || 1;
        const variant = getVariant(selectedColor, selectedSize);
        const buyNowItem = {
            user_id: Number(userId),
            sanpham_id: Number(product.id),
            bienthe_id: variant?.id || null,
            soluong: qty,
            tensanpham: product.tensanpham,
            giaban: Number(product.giaban) || 0,
            giakhuyenmai: Number(product.giakhuyenmai) || 0,
            hinhanh: product.hinhanh || '',
            hinhanh_bienthe: variant?.hinhanh || '',
            kichthuoc: variant?.kichthuoc || null,
            mausac: variant?.mausac || null
        };

        try {
            localStorage.setItem('buy_now_item', JSON.stringify(buyNowItem));
            window.location.href = '/pages/checkout/checkout.html?mode=buynow';
        } catch (error) {
            console.error('Lỗi mua ngay:', error);
            alert('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    });

    if (product.mota) {
        $('mota-content').innerHTML = product.mota;
        $('product-mota').style.display = '';
    }

    $('loading-state').style.display = 'none';
    $('product-detail').style.display = 'flex';
}

async function init() {
    if (!productId) {
        $('loading-state').style.display = 'none';
        $('error-message').textContent = 'Không tìm thấy ID sản phẩm trong URL.';
        $('error-state').style.display = 'flex';
        return;
    }

    try {
        const res = await api.get(`/products/${productId}`);
        if (!res.success || !res.data) {
            throw { message: res.message || 'Không tìm thấy sản phẩm' };
        }
        renderProduct(res.data);
    } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        $('loading-state').style.display = 'none';
        $('error-message').textContent = error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
        $('error-state').style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', init);
