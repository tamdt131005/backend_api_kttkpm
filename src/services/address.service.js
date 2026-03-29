import addressDAO from '../dao/address.dao.js'

class AddressService {
    async postAddress(user_id, addressData){
        const id_address = await addressDAO.postAddress(user_id, addressData);
        if (Number(id_address)<=0)
            throw { status: 404, message: "Thêm địa chỉ mới thất bại" }
        if (addressData.macdinh == 1){
            const conditionMacDinh = await addressDAO.conditionMacDinh(id_address,user_id);
            if (Number(conditionMacDinh) <= 0)
                throw { status: 404, message: "Đặt địa chỉ làm mặc định thất bại" }
        }
        return id_address;
    }

    async conditionMacDinh(id,user_id){
        const MacDinh = await addressDAO.conditionMacDinh(id,user_id);
        if (Number(MacDinh) <= 0)
            throw { status: 404, message: "Đặt địa chỉ làm mặc định thất bại" }
        return;
    }

    async getAllAddress(user_id){
        const allAddress = await addressDAO.getAllAddress(user_id);
        return allAddress || [];
    }

    async getIdAddress(id){
        const idAddress = await addressDAO.getIdAddress(id);
        if (!idAddress|| idAddress.length==0)
            throw { status: 404, message: "Lấy thông tin địa chỉ thất bại" };
        return idAddress;
    }

    async putAddress(id, user_id, addressData){
        const address = await addressDAO.putAddress(id, addressData);
        if (Number(address)<=0)
            throw { status: 404, message: "Cập nhập địa chỉ thất bại" }
        if (addressData.macdinh == 1){
            const conditionMacDinh = await addressDAO.conditionMacDinh(id, user_id);
            if (Number(conditionMacDinh) <= 0)
                throw { status: 404, message: "Đặt địa chỉ làm mặc định thất bại" }
        }
        return address;
    }

    async deleteAddress(id){
        const address = await addressDAO.deleteAddress(id);
        if (Number(address)<=0)
            throw { status: 404, message: "Xóa địa chỉ thất bại" }
    }
}

export default new AddressService();