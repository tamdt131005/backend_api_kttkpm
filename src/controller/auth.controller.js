import bcrypt from "bcrypt";
import authDao from "../dao/auth.dao.js";

export const signup = async (req, res) => {
    try {
        const { username, password, fullname, email } = req.body;
        const actualFullname = fullname || username; // Nếu fullname rỗng thì lấy username

        // Kiểm tra xem user đã tồn tại chưa
        const existingUser = await authDao.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Tên đăng nhập đã tồn tại!"
            });
        }

        const existingEmail = await authDao.getUserByEmail(email);
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email này đã được sử dụng!"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await authDao.createUser(username, hashedPassword, actualFullname, email);

        return res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công!"
        });

    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi Server, vui lòng thử lại sau"
        });
    }
};

export const signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await authDao.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Tài khoản không tồn tại!"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Sai mật khẩu!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            user: {
                id: user.id || user.user_id,
                username: user.username,
                fullname: user.fullname,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi Server, vui lòng thử lại sau"
        });
    }
};