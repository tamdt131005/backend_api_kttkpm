import bcrypt from "bcrypt";
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
            throw { status: 400, message: "Sai mật khẩu!" };
        }

        return {
            id: user.id || user.user_id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            avatar: user.avatar
        };
    }
}

export default new AuthService();
