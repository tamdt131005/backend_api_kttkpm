import AddressService from "../services/address.service.js"

class AddressController {
    async postAddress(req, res) {
        try {
            const { user_id, ...addressData } = req.body;
            const address = await AddressService.postAddress(user_id, addressData);
            res.status(201).json({
                success: true,
                message: "Thêm địa chỉ thành công",
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                success: false,
                message: error.message || "Lỗi Server",
                error: error.message
            });
        }
    }

    async conditionMacDinh(req, res) {
        try {
            const { id, user_id } = req.body;
            const address = await AddressService.conditionMacDinh(id, user_id);
            res.status(200).json({
                success: true,
                message: "Đặt địa làm chỉ mặc định thành công",
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                success: false,
                message: error.message || "Lỗi Server",
                error: error.message
            });
        }
    }

    async getAllAddress(req, res) {
        try {
            const user_id = req.query.user_id || req.body.user_id;
            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu user_id"
                });
            }
            const address = await AddressService.getAllAddress(user_id);
            res.status(200).json({
                success: true,
                message: "Lấy thông tin địa chỉ thành công",
                data: address
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                success: false,
                message: error.message || "Lỗi Server",
                error: error.message
            });
        }
    }

    async getIdAddress(req, res) {
        try {
            const id = req.params.id;
            const address = await AddressService.getIdAddress(id);
            res.status(200).json({
                success: true,
                message: "Lấy thông tin địa chỉ thành công",
                data: address
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                success: false,
                message: error.message || "Lỗi Server",
                error: error.message
            });
        }
    }

    async putAddress(req, res) {
        try {
            const id = req.params.id;
            const { user_id, ...addressData } = req.body;
            const address = await AddressService.putAddress(id, user_id, addressData);
            res.status(200).json({
                success: true,
                message: "Sửa thông tin địa chỉ thành công",
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                success: false,
                message: error.message || "Lỗi Server",
                error: error.message
            });
        }
    }

    async deleteAddress(req, res) {
        try {
            const id = req.params.id;
            const address = await AddressService.deleteAddress(id);
            res.status(200).json({
                success: true,
                message: "Xóa địa chỉ thành công",
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                success: false,
                message: error.message || "Lỗi Server",
                error: error.message
            });
        }
    }
}

export default new AddressController();