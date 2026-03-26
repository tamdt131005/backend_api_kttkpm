import addressService from "../services/address.service.js";

class AddressController {
    // GET /api/address?user_id=...
    async getAddresses(req, res) {
        try {
            const userId = req.query.user_id;
            if (!userId) return res.status(400).json({ success: false, message: "Thiếu user_id" });

            const data = await addressService.getAddresses(userId);
            res.status(200).json({ success: true, message: "Lấy danh sách địa chỉ thành công", data });
        } catch (error) {
            console.error("Lỗi lấy địa chỉ:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }

    // POST /api/address { user_id, tennguoinhan, sodienthoai, ... }
    async createAddress(req, res) {
        try {
            const { user_id, ...addressData } = req.body;
            if (!user_id) return res.status(400).json({ success: false, message: "Thiếu user_id" });

            const id = await addressService.createAddress(user_id, addressData);
            res.status(201).json({ success: true, message: "Tạo địa chỉ thành công", data: { id } });
        } catch (error) {
            const status = error.status || 500;
            console.error("Lỗi tạo địa chỉ:", error);
            res.status(status).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }

    // PUT /api/address/:id/default { user_id }
    async setDefault(req, res) {
        try {
            const id = req.params.id;
            const { user_id } = req.body;
            if (!user_id) return res.status(400).json({ success: false, message: "Thiếu user_id" });

            await addressService.setDefault(id, user_id);
            res.status(200).json({ success: true, message: "Đặt địa chỉ mặc định thành công" });
        } catch (error) {
            const status = error.status || 500;
            console.error("Lỗi đặt mặc định:", error);
            res.status(status).json({ success: false, message: error.message || "Lỗi Server" });
        }
    }
}

export default new AddressController();
