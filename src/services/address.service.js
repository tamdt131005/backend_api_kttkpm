import addressDAO from "../dao/address.dao.js";

class AddressService {
    async getAddresses(userId) {
        return await addressDAO.getAddressesByUserId(userId);
    }

    async getAddressById(id, userId) {
        const address = await addressDAO.getAddressById(id, userId);
        if (!address) {
            throw { status: 404, message: "Không tìm thấy địa chỉ" };
        }
        return address;
    }

    async createAddress(userId, data) {
        if (!data.tennguoinhan || !data.sodienthoai || !data.diachichitiet || !data.phuong || !data.quan || !data.tinh) {
            throw { status: 400, message: "Vui lòng nhập đầy đủ thông tin địa chỉ" };
        }
        return await addressDAO.createAddress(userId, data);
    }

    async setDefault(id, userId) {
        const result = await addressDAO.setDefault(id, userId);
        if (result === 0) {
            throw { status: 404, message: "Không tìm thấy địa chỉ" };
        }
        return result;
    }
}

export default new AddressService();
