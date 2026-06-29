import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authDao from "../dao/auth.dao.js";

class AuthService {

    /**
     * Logic đăng ký tài khoản người dùng mới
     * @param {string} username - Tên đăng nhập
     * @param {string} password - Mật khẩu chưa mã hóa (raw password)
     * @param {string} fullname - Họ và tên đầy đủ
     * @param {string} email - Địa chỉ Email
     */
    async signup(username, password, fullname, email) {
        // 1. Kiểm tra xem username đã có người sử dụng chưa
        const existingUser = await authDao.getUserByUsername(username);
        if (existingUser) {
            // Trả về mã lỗi 409 (Conflict) khi bị trùng lặp dữ liệu độc nhất
            throw { status: 409, message: "Tên đăng nhập đã tồn tại!" };
        }

        // 2. Kiểm tra xem email đã được đăng ký trước đó chưa
        const existingEmail = await authDao.getUserByEmail(email);
        if (existingEmail) {
            throw { status: 409, message: "Email này đã được sử dụng!" };
        }

        // 3. Tiến hành mã hóa mật khẩu để đảm bảo an toàn an ninh dữ liệu (hashing)
        // genSalt(10) sinh chuỗi muối ngẫu nhiên với độ phức tạp là 10 vòng lặp
        const salt = await bcrypt.genSalt(10);
        // hash() kết hợp mật khẩu thô và muối để tạo chuỗi mã hóa không thể đảo ngược
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Lưu tài khoản mới vào cơ sở dữ liệu thông qua tầng DAO
        await authDao.createUser(username, hashedPassword, fullname || username, email);
    }

    /**
     * Logic đăng nhập và cấp chứng chỉ số (JWT)
     * @param {string} username - Tên đăng nhập người dùng gửi lên
     * @param {string} password - Mật khẩu thô người dùng nhập
     * @returns {object} Thông tin người dùng cùng JWT token
     */
    async signin(username, password) {
        // 1. Tìm thông tin người dùng theo username
        const user = await authDao.getUserByUsername(username);
        if (!user) {
            // Trả về mã lỗi 404 (Not Found) nếu không tìm thấy người dùng
            throw { status: 404, message: "Tài khoản không tồn tại!" };
        }

        // 2. So sánh mật khẩu thô người dùng nhập với mật khẩu đã mã hóa lưu trong DB
        // Hàm bcrypt.compare sẽ tự động giải mã cấu trúc muối và so sánh an toàn
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Trả về mã lỗi 401 (Unauthorized) do nhập sai thông tin xác thực mật khẩu
            throw { status: 401, message: "Sai mật khẩu!" };
        }

        // Đảm bảo lấy đúng ID người dùng
        const userId = user.id || user.user_id;

        // 3. Khởi tạo JSON Web Token (JWT) chứa thông tin cơ bản của user
        // Token này dùng để xác thực các request sau này mà không cần truy vấn lại mật khẩu
        const token = jwt.sign(
            { id: userId, username: user.username, role: user.role },
            process.env.JWT_SECRET || "kttkpm_api_backend_shop_jwt_secret_key_2026_xyz",
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // Token có hiệu lực trong 7 ngày
        );

        // 4. Trả về thông tin cần thiết và token xác thực cho Client
        return {
            id: userId,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            avatar: user.avatar,
            token
        };
    }
}

export default new AuthService();
