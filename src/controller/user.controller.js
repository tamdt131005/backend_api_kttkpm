import userService from '../services/user.service.js';

class UserController {
    // Lấy danh sách user (API: GET /api/users/)
    async index(req, res) {
        try {
            const users = await userService.getUsers();
            // Trả về cấu trúc JSON chuẩn
            res.status(200).json({
                success: true,
                message: "Lấy danh sách user thành công",
                data: users
            });
        } catch (error) {
            console.error("Lấy danh sách user có lỗi: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi Server",
                error: error.message
            });
        }
    }

    // Lấy chi tiết user (API: GET /api/users/:username)
    async detail(req, res) {
        try {
            const username = req.params.username;
            const user = await userService.getUserInfo(username);
            
            res.status(200).json({
                success: true,
                message: "Lấy thông tin user thành công",
                data: user
            });
        } catch (error) {
            console.error("Lấy chi tiết user có lỗi: ", error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new UserController();
