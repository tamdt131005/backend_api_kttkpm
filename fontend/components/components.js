class AppHeader extends HTMLElement {
    connectedCallback() {
        const isLogged = localStorage.getItem("isLoggedIn") === "true";
        const role = (localStorage.getItem("role") || "user").toLowerCase();
        const isAdmin = role === "admin";
        const username = localStorage.getItem("username") || "user_test";
        const fullname = localStorage.getItem("fullname") || "Người dùng";
        const avatarFile = localStorage.getItem("avatar") || "";
        const avatar = imageUtil.avatar(avatarFile);

        const currentPath = window.location.pathname.toLowerCase();
        if (isLogged && isAdmin && !currentPath.includes('/pages/admin/')) {
            window.location.href = '/pages/admin/index.html';
            return;
        }

        const logoHref = '/index.html';
        const profileHref = isAdmin
            ? '/pages/admin/index.html'
            : '/pages/profile/profile.html';
        const addressHref = '/pages/profile/address.html';
        const ordersHref = '/pages/profile/orders.html';
        const cartHref = '/pages/cart/index.html';
        const adminHref = '/pages/admin/index.html';
        const loginHref = '/pages/auth/login.html';
        const registerHref = '/pages/auth/register.html';

        let userHtml = "";
        if (isLogged) {
            userHtml = `
                <div class="tai-khoan-wrap" id="tai-khoan-dropdown-trigger">
                    <img src="${avatar}" alt="Avatar" class="avatar-nho">
                    <div class="dropdown-menu-user" id="dropdown-menu-user">
                        <a href="${profileHref}" class="user-info-header">
                            <img src="${avatar}" alt="Avatar" class="avatar-lon">
                            <div class="user-text">
                                <span class="ten-user">${username}</span>
                                <span class="ten-day-du">${fullname}</span>
                            </div>
                        </a>
                        <ul class="danh-sach-menu">
                            ${isAdmin ? `
                            <li>
                                <a href="${adminHref}">
                                    <span class="icon-ke"><i class="fas fa-user-shield"></i></span>
                                    Quản trị
                                </a>
                            </li>
                            ` : ''}
                            <li>
                                <a href="${addressHref}">
                                    <span class="icon-ke"><i class="fas fa-location-dot"></i></span>
                                    Địa chỉ
                                </a>
                            </li>
                            <li>
                                <a href="${ordersHref}">
                                    <span class="icon-ke"><i class="fas fa-receipt"></i></span>
                                    Đơn hàng
                                </a>
                            </li>
                            <li>
                                <a href="${cartHref}">
                                    <span class="icon-ke"><i class="fas fa-shopping-cart"></i></span>
                                    Giỏ hàng
                                </a>
                            </li>
                            <li class="border-top">
                                <a href="#" onclick="localStorage.clear(); location.reload();" class="dang-xuat">
                                    <span class="icon-ke"><i class="fas fa-sign-out-alt"></i></span>
                                    Đăng xuất
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            userHtml = `
                <div class="auth-links">
                    <a href="${loginHref}" class="btn-login">Đăng nhập</a>
                    <a href="${registerHref}" class="btn-register">Đăng ký</a>
                </div>
            `;
        }

        this.innerHTML = `
            <header class="header-chinh">
                <div class="header-container">
                    <div class="logo-area">
                        <a href="${logoHref}">
                            <img src="${imageUtil.logo()}" alt="Logo">
                        </a>
                    </div>

                    <div class="search-area">
                        <form class="form-tim-kiem nav-search" action="/pages/category/index.html" method="get">
                            <input type="text" name="q" id="search-input" placeholder="Tìm kiếm sản phẩm..." autocomplete="off">
                            <button type="submit"><i class="fas fa-search"></i></button>

                            <div class="search-results" id="search-results" style="display: none;">
                                <div class="search-loading" id="search-loading">
                                    <i class="fas fa-spinner fa-spin"></i> Đang tìm kiếm...
                                </div>
                                <div class="search-items" id="search-items"></div>
                                <div class="search-empty" id="search-empty" style="display: none;">
                                    <i class="fas fa-search"></i>
                                    <p>Không tìm thấy sản phẩm nào</p>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="user-area">
                        ${userHtml}
                    </div>
                </div>
            </header>
        `;
        const trigger = this.querySelector('#tai-khoan-dropdown-trigger');
        const dropdown = this.querySelector('#dropdown-menu-user');

        if (trigger && dropdown) {
            trigger.addEventListener('click', function (e) {
                dropdown.classList.toggle('hien-thi');
                e.stopPropagation();
            });

            document.addEventListener('click', function (e) {
                if (!trigger.contains(e.target)) {
                    dropdown.classList.remove('hien-thi');
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    dropdown.classList.remove('hien-thi');
                }
            });
        }

        const searchInput = this.querySelector('#search-input');
        const searchResults = this.querySelector('#search-results');
        const searchItems = this.querySelector('#search-items');
        const searchLoading = this.querySelector('#search-loading');
        const searchEmpty = this.querySelector('#search-empty');
        const navSearch = this.querySelector('.nav-search');

        if (!searchInput || !searchResults || !searchItems || !searchLoading || !searchEmpty || !navSearch) return;

        let searchTimeout = null;
        let currentSearchQuery = '';

        function dinhDangGia(price) {
            return Math.round(Number(price) || 0).toLocaleString('vi-VN');
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

        function fillkq(products) {
            searchItems.innerHTML = '';
            searchEmpty.style.display = 'none';

            products.forEach((product) => {
                const item = document.createElement('a');
                item.className = 'search-item';
                item.href = `/pages/product/productdetail.html?id=${product.sanpham_id}`;

                const imageSrc = imageUtil.product(product.hinhanh || '');
                const giaban = Number(product.giaban) || 0;
                const giakhuyenmai = Number(product.giakhuyenmai) || 0;
                const hasDiscount = giakhuyenmai > 0 && giakhuyenmai < giaban;
                const displayPrice = hasDiscount ? giakhuyenmai : giaban;
                const highlightedName = product.tensanpham || '';

                item.innerHTML = `
                    <img src="${imageSrc}" alt="${highlightedName}" class="search-item-image">
                    <div class="search-item-info">
                        <div class="search-item-name">${highlightedName}</div>
                        <div class="search-item-price">
                            <span class="search-item-price-sale">${dinhDangGia(displayPrice)}₫</span>
                            ${hasDiscount ? `<span class="search-item-price-original">${dinhDangGia(giaban)}₫</span>` : ''}
                        </div>
                    </div>
                `;

                searchItems.appendChild(item);
            });
        }

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
                    const data = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=6`);

                    if (query !== currentSearchQuery) return;

                    searchLoading.style.display = 'none';

                    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                        fillkq(data.data);
                    } else {
                        khongcokq();
                    }
                } catch (error) {
                    if (query !== currentSearchQuery) return;
                    searchLoading.style.display = 'none';
                    khongcokq();
                }
            }, 300);
        }

        searchInput.addEventListener('input', function (e) {
            currentSearchQuery = e.target.value.trim();
            timkiem(currentSearchQuery);
        });

        searchInput.addEventListener('focus', function () {
            if (currentSearchQuery && currentSearchQuery.length >= 2) {
                timkiem(currentSearchQuery);
            }
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                anketqua();
                searchInput.blur();
            }
        });

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.nav-search')) {
                anketqua();
            }
        });

        searchResults.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }
}
customElements.define('app-header', AppHeader);

class AppFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="site-footer">
                <div class="footer-bottom">
                    <p>&copy; 2025 bTap Shop. Developed by <strong>Nhóm 74DCTT21</strong> — Đặng Thành Tâm • Triệu Quang Ninh •
                        Bùi Đức Huy • Lê Mạnh Hùng • Nguyễn Hồng Sơn</p>
                </div>
            </footer>
        `;
    }
}
customElements.define('app-footer', AppFooter);
