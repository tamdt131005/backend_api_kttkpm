import orderDAO from "../dao/order.dao.js";
import cartDAO from "../dao/cart.dao.js";
import addressDAO from "../dao/address.dao.js";
import momoService from "./momo.service.js";

function maHoaDuLieuBoSung(payload) {
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

class OrderService {
    chuanHoaPhuongThucThanhToan(phuongThucDauVao) {
        const phuongThucGoc = String(phuongThucDauVao || "tienmat").toLowerCase();
        if (phuongThucGoc === "momo" || phuongThucGoc === "chuyenkhoan") {
            return "momo";
        }

        if (phuongThucGoc === "tienmat") {
            return "tienmat";
        }

        throw { status: 400, message: "Phuong thuc thanh toan khong hop le" };
    }

    async taoPhienThanhToanMomo({ maDonHang, tongThanhToan, donHangId, nguoiDungId }) {
        const maDonHangChuan = String(maDonHang || "");
        const soTienChuan = Math.round(Number(tongThanhToan || 0));

        if (!maDonHangChuan) {
            throw { status: 400, message: "Thieu ma don hang" };
        }

        if (!Number.isFinite(soTienChuan) || soTienChuan <= 0) {
            throw { status: 400, message: "Gia tri don hang khong hop le" };
        }

        const ketQuaMomo = await momoService.taoThanhToan({
            orderId: maDonHangChuan,
            amount: soTienChuan,
            orderInfo: `Thanh toan don hang ${maDonHangChuan}`,
            extraData: maHoaDuLieuBoSung({ order_id: donHangId, user_id: nguoiDungId })
        });

        if (Number(ketQuaMomo?.resultCode) !== 0) {
            throw {
                status: 400,
                message: ketQuaMomo?.message || "Tao thanh toan MoMo that bai"
            };
        }

        if (!ketQuaMomo?.payUrl) {
            throw { status: 400, message: "MoMo khong tra ve link thanh toan" };
        }

        return {
            payUrl: ketQuaMomo.payUrl,
            deeplink: ketQuaMomo.deeplink || null,
            qrCodeUrl: ketQuaMomo.qrCodeUrl || null,
            expired_time: ketQuaMomo.expiredTime || null
        };
    }

    async createOrder(userId, addressId, note, paymentMethodInput, checkoutItems = null) {
        const phuongThucThanhToan = this.chuanHoaPhuongThucThanhToan(paymentMethodInput);
        const phuongThucThanhToanLuuDB = phuongThucThanhToan === "momo" ? "chuyenkhoan" : "tienmat";

        let danhSachSanPhamDatHang = [];
        let tamTinh = 0;
        const donMuaNgay = Array.isArray(checkoutItems) && checkoutItems.length > 0;

        if (donMuaNgay) {
            for (const sanPhamMuaNgay of checkoutItems) {
                const sanPhamId = Number(sanPhamMuaNgay?.sanpham_id);
                const bienTheId = sanPhamMuaNgay?.bienthe_id !== undefined && sanPhamMuaNgay?.bienthe_id !== null ?
                    Number(sanPhamMuaNgay.bienthe_id) : null;
                const soLuong = Number(sanPhamMuaNgay?.soluong || 0);

                if (!Number.isInteger(sanPhamId) || sanPhamId <= 0 || !Number.isInteger(soLuong) || soLuong <= 0) {
                    throw { status: 400, message: "Du lieu mua ngay khong hop le" };
                }

                const thongTinSanPham = await orderDAO.getProductSnapshotForOrderItem(sanPhamId, bienTheId);
                if (!thongTinSanPham) {
                    throw { status: 404, message: "Khong tim thay san pham dat hang" };
                }

                if (bienTheId && Number(thongTinSanPham.soluong_kho || 0) < soLuong) {
                    throw { status: 400, message: `San pham ${thongTinSanPham.tensanpham} khong du ton kho` };
                }

                const donGia =
                    thongTinSanPham.giakhuyenmai !== null &&
                    Number(thongTinSanPham.giakhuyenmai) > 0 &&
                    Number(thongTinSanPham.giakhuyenmai) < Number(thongTinSanPham.giaban) ?
                    Number(thongTinSanPham.giakhuyenmai) :
                    Number(thongTinSanPham.giaban);

                const chiTietDonHang = {
                    sanpham_id: thongTinSanPham.sanpham_id,
                    bienthe_id: thongTinSanPham.bienthe_id,
                    tensanpham: thongTinSanPham.tensanpham,
                    kichthuoc: thongTinSanPham.kichthuoc,
                    mausac: thongTinSanPham.mausac,
                    ma_sku: thongTinSanPham.ma_sku,
                    dongia: donGia,
                    soluong: soLuong,
                    thanhtien: donGia * soLuong
                };

                danhSachSanPhamDatHang.push(chiTietDonHang);
                tamTinh += chiTietDonHang.thanhtien;
            }
        } else {
            const danhSachGioHang = await cartDAO.getCartByUserId(userId);
            if (!Array.isArray(danhSachGioHang) || danhSachGioHang.length === 0) {
                throw { status: 400, message: "Gio hang trong" };
            }

            danhSachSanPhamDatHang = danhSachGioHang.map((mucGioHang) => {
                const donGia =
                    mucGioHang.giakhuyenmai !== null && mucGioHang.giakhuyenmai > 0 && mucGioHang.giakhuyenmai < mucGioHang.giaban ?
                    Number(mucGioHang.giakhuyenmai) :
                    Number(mucGioHang.giaban);

                const chiTietDonHang = {
                    sanpham_id: mucGioHang.sanpham_id,
                    bienthe_id: mucGioHang.bienthe_id,
                    tensanpham: mucGioHang.tensanpham,
                    kichthuoc: mucGioHang.kichthuoc,
                    mausac: mucGioHang.mausac,
                    ma_sku: null,
                    dongia: donGia,
                    soluong: mucGioHang.soluong,
                    thanhtien: donGia * mucGioHang.soluong
                };

                tamTinh += chiTietDonHang.thanhtien;
                return chiTietDonHang;
            });
        }

        if (danhSachSanPhamDatHang.length === 0) {
            throw { status: 400, message: "Khong co san pham de dat hang" };
        }

        const diaChi = await addressDAO.getAddressById(addressId, userId);
        if (!diaChi) {
            throw { status: 404, message: "Khong tim thay dia chi giao hang" };
        }

        const snapshotDiaChi = JSON.stringify({
            tennguoinhan: diaChi.tennguoinhan,
            sodienthoai: diaChi.sodienthoai,
            diachichitiet: diaChi.diachichitiet,
            phuong: diaChi.phuong,
            quan: diaChi.quan,
            tinh: diaChi.tinh
        });

        const phiVanChuyen = 30000;
        const tongThanhToan = tamTinh + phiVanChuyen;
        const maDonHang = `DH${Date.now()}`;

        const duLieuDonHang = {
            ma_donhang: maDonHang,
            user_id: userId,
            diachi_id: addressId,
            snapshot_diachi: snapshotDiaChi,
            ghichu: note,
            phuongthuc_thanhtoan: phuongThucThanhToanLuuDB,
            tongtienhang: tamTinh,
            phivanchuyen: phiVanChuyen,
            tongthanhtoan: tongThanhToan
        };

        const donHangIdMoi = await orderDAO.taoDonHang(duLieuDonHang);
        await orderDAO.taoChiTietDonHang(donHangIdMoi, danhSachSanPhamDatHang);

        for (const chiTietDonHang of danhSachSanPhamDatHang) {
            if (chiTietDonHang.bienthe_id) {
                await orderDAO.updateTonkho(chiTietDonHang.bienthe_id, chiTietDonHang.soluong);
            }
        }

        await orderDAO.addLichSuDonHang(donHangIdMoi, userId, "choxacnhan", "Dat hang moi");
        if (!donMuaNgay) {
            await cartDAO.clearCart(userId);
        }

        let duLieuThanhToanMomo = null;
        if (phuongThucThanhToan === "momo") {
            duLieuThanhToanMomo = await this.taoPhienThanhToanMomo({
                maDonHang,
                tongThanhToan,
                donHangId: donHangIdMoi,
                nguoiDungId: userId
            });
        }

        return {
            donhang_id: donHangIdMoi,
            ma_donhang: maDonHang,
            tongthanhtoan: tongThanhToan,
            ...(duLieuThanhToanMomo || {})
        };
    }

    async getOrders(userId) {
        return await orderDAO.getDonHangCuaUser(userId);
    }

    async updateTrangThaiMOMO(maDonHang, resultCode) {
        const maDon = String(maDonHang ?? '').trim();
        if (!maDon) {
            throw {
                status: 401,
                message: "Thanh Toán Không Thành Công"
            };
        }

        if (Number(resultCode) === 0) {
            // Thanh toán thành công
            await orderDAO.updateTrangThaiThanhToan(maDon, 'dathanhtoan', 'chuyenkhoan');
        } else {
            // Thanh toán thất bại (resultCode !== 0, ví dụ 1002) → giữ trạng thái chưa thanh toán
            await orderDAO.updateTrangThaiThanhToan(maDon, 'chuathanhtoan', 'chuyenkhoan');
        }
    }

    async getOrderById(orderId, userId) {
        const donHang = await orderDAO.getOrderById(orderId, userId);
        if (!donHang) {
            throw { status: 404, message: "Không tìm thấy đơn hàng" };
        }
        return donHang;
    }

    async cancelOrder(orderId, userId, lydoHuy) {
        const donHang = await orderDAO.getOrderRowForUser(orderId, userId);
        if (!donHang) {
            throw { status: 404, message: "Không tìm thấy đơn hàng" };
        }

        if (donHang.trangthai !== 'choxacnhan') {
            throw { status: 400, message: "Chỉ được hủy đơn hàng ở trạng thái chờ xác nhận" };
        }

        const danhSachChiTiet = await orderDAO.getOrderItems(orderId);
        for (const chiTiet of danhSachChiTiet) {
            if (chiTiet.bienthe_id) {
                await orderDAO.restoreTonkho(chiTiet.bienthe_id, chiTiet.soluong);
            }
        }

        const soDongCapNhat = await orderDAO.cancelOrder(orderId, lydoHuy);
        if (soDongCapNhat <= 0) {
            throw { status: 400, message: "Không thể hủy đơn hàng" };
        }

        await orderDAO.addLichSuDonHang(
            Number(orderId),
            Number(userId),
            'dahuy',
            lydoHuy || 'Người dùng hủy đơn'
        );
    }
}

export default new OrderService();