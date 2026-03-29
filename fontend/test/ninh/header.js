
document.addEventListener('DOMContentLoaded', function () {
    const avatarBtns = document.querySelectorAll('.user-avatar');
    let hoverTimeout = null;
    let closeTimeout = null;

    avatarBtns.forEach(btn => {
        const box = btn.closest('.user-box');
        if (!box) return;
        const menu = box.querySelector('.user-menu');


        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            box.classList.toggle('open');
            const expanded = box.classList.contains('open');
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            if (menu) menu.setAttribute('aria-hidden', expanded ? 'false' : 'true');
        });
        box.addEventListener('mouseenter', function () {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
            box.classList.add('open');
            if (menu) menu.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
        });

        box.addEventListener('mouseleave', function () {
            closeTimeout = setTimeout(() => {
                box.classList.remove('open');
                if (menu) menu.setAttribute('aria-hidden', 'true');
                btn.setAttribute('aria-expanded', 'false');
            }, 200);
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.user-box')) {
            document.querySelectorAll('.user-box.open').forEach(b => {
                b.classList.remove('open');
                const btn = b.querySelector('.user-avatar');
                const menu = b.querySelector('.user-menu');
                if (btn) btn.setAttribute('aria-expanded', 'false');
                if (menu) menu.setAttribute('aria-hidden', 'true');
            });
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.user-box.open').forEach(b => {
                b.classList.remove('open');
                const btn = b.querySelector('.user-avatar');
                const menu = b.querySelector('.user-menu');
                if (btn) btn.setAttribute('aria-expanded', 'false');
                if (menu) menu.setAttribute('aria-hidden', 'true');
            });
        }
    });

    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchItems = document.getElementById('search-items');
    const searchLoading = document.getElementById('search-loading');
    const searchEmpty = document.getElementById('search-empty');

    if (!searchInput) return;
    let searchTimeout = null;
    let currentSearchQuery = '';

    function timkiem(query) {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        if (!query || query.length < 2) {
            anketqua();
            return;
        }

        searchResults.style.display = 'block';
        searchLoading.style.display = 'block';
        searchItems.innerHTML = '';
        searchEmpty.style.display = 'none';

        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`/btap_web/src/api/products/search.php?q=${encodeURIComponent(query)}&limit=6`);
                const data = await response.json();

                searchLoading.style.display = 'none';

                if (data.success && data.data && data.data.length > 0) {
                    fillkq(data.data, query);
                } else {
                    khongcokq();
                }
            } catch (error) {
                searchLoading.style.display = 'none';
                khongcokq();
            }
        }, 300);
    }

    function fillkq(products, query) {
        searchItems.innerHTML = '';
        searchEmpty.style.display = 'none';

        products.forEach(product => {
            const item = document.createElement('a');
            item.className = 'search-item';
            item.href = `/btap_web/src/views/product.php?id=${product.sanpham_id}`;

            const imageSrc = product.hinhanh
                ? `/btap_web/src/public/img/sanpham/${product.hinhanh}`
                : '/btap_web/src/public/img/sanpham/default.png';

            const hasDiscount = product.giakhuyenmai > 0 && product.giakhuyenmai < product.giaban;
            const displayPrice = hasDiscount ? product.giakhuyenmai : product.giaban;

            const highlightedName = product.tensanpham;

            item.innerHTML = `
                <img src="${imageSrc}" alt="${product.tensanpham}" class="search-item-image">
                <div class="search-item-info">
                    <div class="search-item-name">${highlightedName}</div>
                    <div class="search-item-price">
                        <span class="search-item-price-sale">${dinhDangGia(displayPrice)}₫</span>
                        ${hasDiscount ? `<span class="search-item-price-original">${dinhDangGia(product.giaban)}₫</span>` : ''}
                    </div>
                </div>
            `;

            searchItems.appendChild(item);
        });
    }

    function dinhDangGia(price) {
        return Math.round(price).toLocaleString('vi-VN');
    }

    function khongcokq() {
        searchItems.innerHTML = '';
        searchEmpty.style.display = 'block';
    }

    function anketqua() {
        searchResults.style.display = 'none';
        searchItems.innerHTML = '';
        searchLoading.style.display = 'none';
        searchEmpty.style.display = 'none';
    }

    searchInput.addEventListener('input', function (e) {
        currentSearchQuery = e.target.value.trim();
        timkiem(currentSearchQuery);
    });

    searchInput.addEventListener('focus', function (e) {
        if (currentSearchQuery && currentSearchQuery.length >= 2) {
            timkiem(currentSearchQuery);
        }
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav-search')) {
            anketqua();
        }
    });

    if (searchResults) {
        searchResults.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            anketqua();
            searchInput.blur();
        }
    });
});