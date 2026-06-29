import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authDao from "../dao/auth.dao.js";

class AuthService {

    async signup(username, password, fullname, email) {
        const existingUser = await authDao.getUserByUsername(username);
        if (existingUser) {
            throw { status: 409, message: "Tên đăng nhập đã tồn tại!" };
        }

        const existingEmail = await authDao.getUserByEmail(email);
        if (existingEmail) {
            throw { status: 409, message: "Email này đã được sử dụng!" };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await authDao.createUser(username, hashedPassword, fullname || username, email);
    }

    async signin(username, password) {
        const user = await authDao.getUserByUsername(username);
        if (!user) {
            throw { status: 404, message: "Tài khoản không tồn tại!" };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw { status: 401, message: "Sai mật khẩu!" };
        }

        const userId = user.id || user.user_id;

        // Tạo JWT Token chứa thông tin định danh của user
        const token = jwt.sign(
            { id: userId, username: user.username, role: user.role },
            process.env.JWT_SECRET || "kttkpm_api_backend_shop_jwt_secret_key_2026_xyz",
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        return {
            id: userId,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            avatar: user.avatar,
            token // Trả về token cho client
        };
    }
}

export default new AuthService();
