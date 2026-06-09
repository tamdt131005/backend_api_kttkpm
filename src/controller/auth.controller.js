import authService from "../services/auth.service.js";

export const signup = async (req, res) => {
    try {
        const { username, password, fullname, email } = req.body;
        await authService.signup(username, password, fullname, email);

        return res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công!"
        });

    } catch (error) {
        const status = error.status || 500;
        const message = error.message || "Lỗi Server, vui lòng thử lại sau";
        console.error("Lỗi khi đăng ký:", error);
        return res.status(status).json({
            success: false,
            message
        });
    }
};

export const signin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authService.signin(username, password);

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
            token: result.token
        });

    } catch (error) {
        const status = error.status || 500;
        const message = error.message || "Lỗi Server, vui lòng thử lại sau";
        console.error("Lỗi khi đăng nhập:", error);
        return res.status(status).json({
            success: false,
            message
        });
    }
};