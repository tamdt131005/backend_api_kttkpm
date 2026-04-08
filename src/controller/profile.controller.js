import profileService from "../services/profile.service.js"

class profileController {
    async uploadAvatar(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu file avatar"
                });
            }

            res.status(201).json({
                success: true,
                message: "Upload avatar thành công",
                data: {
                    avatar: `avatar/${req.file.filename}`
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi Server",
                error: error.message
            });
        }
    }

    async getProfile (req, res){
        try {
            const id = req.params.id;
            const profile = await profileService.getProfile(id);
            res.status(200).json({
                success: true,
                message: "Lấy thông tin thành công",
                data: profile
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi Server",
                error: error.message
            });
        }
    }

    async putProfile(req, res){
        try {
            const {id,...profileData} = req.body;
            const profile = await profileService.putProfile(id,profileData);
            res.status(201).json({
                success: true,
                message: "Cập nhật hồ sơ thành công",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Lỗi Server",
                error: error.message
            });
        }
    }
}

export default new profileController();