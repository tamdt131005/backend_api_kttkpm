import pool from "../config/db.js";

class AddressDao{
    async postAddress(user_id, addressData){
        const { tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh } = addressData;
        const [row] = await pool.execute('INSERT INTO diachigiaohang (user_id, tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh) VALUES (?,?,?,?,?,?,?)',[user_id, tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh])
        return row.insertId;
    }

    async conditionMacDinh(id,user_id){
        await pool.execute('UPDATE diachigiaohang SET macdinh = 0 WHERE user_id = ?',[user_id]);
        const [row] = await pool.execute('UPDATE diachigiaohang SET macdinh = 1 WHERE user_id = ? AND id = ?',[user_id, id]);
        return row.affectedRows;
    }

    async getAllAddress(user_id){
        const [rows] = await pool.execute('SELECT * FROM diachigiaohang WHERE user_id = ?',[user_id]);
        return rows;
    }

    async getAddressById(id, user_id){
        const [rows] = await pool.execute('SELECT * FROM diachigiaohang WHERE id = ? AND user_id = ?',[id, user_id]);
        return rows[0] || null;
    }

    async getIdAddress(id){
        const [row] = await pool.execute('SELECT * FROM diachigiaohang WHERE id = ?',[id]);
        return row;
    }

    async putAddress(id, addressData) {
        const { tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh} = addressData;
        const [row] = await pool.execute('UPDATE diachigiaohang SET tennguoinhan = ?, sodienthoai = ?, diachichitiet = ?, phuong = ?, quan = ?, tinh = ? WHERE id = ?', [tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh, id]);
        return row.affectedRows;
    }

    async deleteAddress(id){
        const [row] = await pool.execute('DELETE FROM diachigiaohang WHERE id = ? and macdinh = 0',[id]);
        return row.affectedRows;
    }
}
export default new AddressDao();