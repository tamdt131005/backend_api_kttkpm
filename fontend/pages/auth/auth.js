// Yêu cầu file api.js đã được tải trước để sử dụng biến BASE_URL

document.addEventListener("DOMContentLoaded", () => {
    // 1. Xử lý Form Đăng nhập
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Ngăn trình duyệt tải lại trang

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const errorDiv = document.getElementById("login-error");
            const errorText = document.getElementById("login-error-text");

            try {
                // Gọi API backend bằng fetch (API Node.js)
                const response = await fetch(`${BASE_URL}/auth/signin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Đăng nhập thành công, lưu thông tin vào localStorage để Web Component AppHeader nhận diện
                    localStorage.setItem("isLoggedIn", "true");
                    
                    // Lấy dữ liệu user trả về từ API (ví dụ data.data.user_info.username) 
                    // Tùy thuộc cấu trúc API backend của bạn, hãy sửa lại cho phù hợp
                    const user = data.data?.user || data.data || {};

                    localStorage.setItem("username", user.username || username);
                    localStorage.FormName = user.fullname;
                    localStorage.setItem("fullname", user.fullname || user.name || username);
                    localStorage.setItem("avatar", user.avatar || "../../assets/images/user.webp");
                    if (data.token || data.data?.token) {
                        localStorage.setItem("token", data.token || data.data.token); // Lưu token bảo mật
                    }

                    // Chuyển hướng về trang chủ
                    window.location.href = "../../index.html";
                } else {
                    // Đăng nhập thất bại (sai pass, username)
                    errorDiv.style.display = "flex";
                    errorText.innerText = data.message || "Tên đăng nhập hoặc mật khẩu không đúng.";
                }
            } catch (error) {
                console.error("Lỗi gọi API đăng nhập:", error);
                errorDiv.style.display = "flex";
                errorText.innerText = "Lỗi kết nối máy chủ. Backend Node.js chưa chạy hoặc sai đường dẫn.";
            }
        });
    }

    // 2. Xử lý Form Đăng ký
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirm_password = document.getElementById("confirm_password").value;
            
            const errorDiv = document.getElementById("register-error");
            const errorText = document.getElementById("register-error-text");
            const successDiv = document.getElementById("register-success");

            // Tự động kiểm tra trên Client trước (Đúng chuẩn UX)
            if (password !== confirm_password) {
                errorDiv.style.display = "flex";
                errorText.innerText = "Mật khẩu xác nhận không khớp!";
                return;
            }

            try {
                // Data cho backend NodeJS
                const payload = {
                    username: username,
                    password: password,
                    email: email
                };

                const response = await fetch(`${BASE_URL}/auth/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Mở băng báo thành công
                    errorDiv.style.display = "none";
                    successDiv.style.display = "flex";
                    
                    // Chuyển về trang đăng nhập sau 2s
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    // Backend từ chối do trùng lặp hoặc lỗi regex DB
                    errorDiv.style.display = "flex";
                    errorText.innerText = data.message || "Tên đăng nhập đã tồn tại hoặc lỗi đăng ký.";
                }
            } catch (error) {
                console.error("Lỗi gọi API đăng ký:", error);
                errorDiv.style.display = "flex";
                errorText.innerText = "Lỗi kết nối máy chủ backend. Kiểm tra Terminal.";
            }
        });
    }
});
