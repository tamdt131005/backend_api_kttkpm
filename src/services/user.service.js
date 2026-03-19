import userDAO from '../dao/user.dao.js';

class UserService {
    async getUsers() {
        // Business logic co the duoc xu ly o day (vi du: format du lieu truoc khi tra ve)
        const users = await userDAO.getAllUsers();
        return users;
    }

    async getUserInfo(username) {
        if (!username) {
            throw new Error("Username không hợp lệ"); // Username is invalid
        }
        const user = await userDAO.getUserByUsername(username);
        if (!user) {
             throw new Error("Không tìm thấy user"); // User not found
        }
        // Ngăn chặn trả về password cho Client (Bảo mật cơ bản)
        delete user.password;
        return user;
    }
}

export default new UserService();
