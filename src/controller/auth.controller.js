import authService from "../services/auth.service.js";

/**
 * Controller xử lý yêu cầu Đăng ký (Signup)
 * Nhận request từ router, gọi tới Service xử lý logic và trả về response tương ứng
 */
export const signup = async (req, res) => {
    try {
        // Lấy thông tin tài khoản đăng ký được gửi lên từ body của request
        const { username, password, fullname, email } = req.body;
        
        // Gọi tầng Service để thực hiện kiểm tra trùng lặp và lưu vào database
        await authService.signup(username, password, fullname, email);

        // Trả về HTTP Status 201 (Created) khi đăng ký thành công tài khoản mới
        return res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công!"
        });

    } catch (error) {
        // Nếu có lỗi ném ra từ Service (trùng username/email), lấy mã trạng thái tương ứng, mặc định là 500
        const status = error.status || 500;
        const message = error.message || "Lỗi Server, vui lòng thử lại sau";
        console.error("Lỗi khi đăng ký:", error);
        
        // Phản hồi về client với mã lỗi thích hợp
        return res.status(status).json({
            success: false,
            message
        });
    }
};

/**
 * Controller xử lý yêu cầu Đăng nhập (Signin)
 * Nhận request, gửi thông tin xác thực đến Service và trả về thông tin user cùng JWT Token
 */
export const signin = async (req, res) => {
    try {
        // Lấy tài khoản & mật khẩu đăng nhập từ body của request
        const { username, password } = req.body;
        
        // Gọi tầng Service thực hiện so khớp mật khẩu và tạo JWT Token xác thực
        const result = await authService.signin(username, password);

        // Trả về HTTP Status 200 (OK) kèm theo thông tin cá nhân và Token đăng nhập
        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            user: {
                id: result.id,
                username: result.username,
                fullname: result.fullname,
                role: result.role,
                avatar: result.avatar
            },
            token: result.token // Token này client sẽ lưu ở LocalStorage/Cookie để dùng cho các request tiếp theo
        });

    } catch (error) {
        // Nếu sai mật khẩu (401) hoặc không tồn tại tài khoản (404), trả về mã tương ứng
        const status = error.status || 500;
        const message = error.message || "Lỗi Server, vui lòng thử lại sau";
        console.error("Lỗi khi đăng nhập:", error);
        
        return res.status(status).json({
            success: false,
            message
        });
    }
};