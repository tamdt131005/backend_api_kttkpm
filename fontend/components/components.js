class AppHeader extends HTMLElement {
    connectedCallback() {
        const isLogged = localStorage.getItem("isLoggedIn") === "true";
        const username = localStorage.getItem("username") || "user_test";
        const fullname = localStorage.getItem("fullname") || "Người dùng";
        const avatarFile = localStorage.getItem("avatar") || "";
        const avatar = imageUtil.avatar(avatarFile);

        let userHtml = "";
        if (isLogged) {
            userHtml = `
                <div class="tai-khoan-wrap" id="tai-khoan-dropdown-trigger">
                    <img src="${avatar}" alt="Avatar" class="avatar-nho">
                    <div class="dropdown-menu-user" id="dropdown-menu-user">
                        <a href="#" class="user-info-header">
                            <img src="${avatar}" alt="Avatar" class="avatar-lon">
                            <div class="user-text">
                                <span class="ten-user">${username}</span>
                                <span class="ten-day-du">${fullname}</span>
                            </div>
                        </a>
                        <ul class="danh-sach-menu">
                            <li>
                                <a href="#">
                                    <span class="icon-ke"><i class="fas fa-location-dot"></i></span>
                                    Địa chỉ
                                </a>
                            </li>
                            <li>
                                <a href="/pages/cart/index.html">
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
                    <a href="/pages/auth/login.html" class="btn-login">Đăng nhập</a>
                    <a href="/pages/auth/register.html" class="btn-register">Đăng ký</a>
                </div>
            `;
        }

        this.innerHTML = `
            <header class="header-chinh">
                <div class="header-container">
                    <!-- Logo -->
                    <div class="logo-area">
                        <a href="/index.html">
                            <img src="/assets/images/logo.svg" alt="Logo">
                        </a>
                    </div>

                    <!-- Search Bar -->
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

                    <!-- User Actions -->
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
        }
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
