document.addEventListener("DOMContentLoaded", () => {
    // sử lí trang đăng nhập
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // không cho tải lại trang
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const errorDiv = document.getElementById("login-error");
            const errorText = document.getElementById("login-error-text");

            try {
                const data = await api.post('/auth/signin', { username, password });

                if (data.success) {
                    localStorage.setItem("isLoggedIn", "true");
                    // API signin trả về: { success, user: { id, username, fullname, ... } }
                    const user = data.user || {};
                    const role = String(user.role || "user").toLowerCase();
                    localStorage.setItem("user_id", user.id);
                    localStorage.setItem("username", user.username || username);
                    localStorage.setItem("fullname", user.fullname || username);
                    localStorage.setItem("avatar", user.avatar || "user.webp");
                    localStorage.setItem("role", role);

                    // không dùng jwt
                    // if (data.token || data.data?.token) {
                    //     localStorage.setItem("token", data.token || data.data.token);
                    // }
                    if (role === "admin") {
                        window.location.href = "../../pages/admin/index.html";
                    } else {
                        window.location.href = "../../index.html";
                    }
                } else {
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

            if (password !== confirm_password) {
                errorDiv.style.display = "flex";
                errorText.innerText = "Mật khẩu xác nhận không khớp!";
                return;
            }

            try {
                // Dùng api phần đăng nhập
                const data = await api.post('/auth/signup', { username, password, email });

                if (data.success) {
                    errorDiv.style.display = "none";
                    successDiv.style.display = "flex";
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
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
