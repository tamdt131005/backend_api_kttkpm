import userDAO from '../dao/user.dao.js';

class UserService {
    async getUsers() {
        const users = await userDAO.getAllUsers();
        return users;
    }

    async getUserInfo(username) {
        if (!username) {
            throw new Error("Username không hợp lệ");
        }
        const user = await userDAO.getUserByUsername(username);
        if (!user) {
            throw new Error("Không tìm thấy user");
        }
        delete user.password;
        return user;
    }
}

export default new UserService();
