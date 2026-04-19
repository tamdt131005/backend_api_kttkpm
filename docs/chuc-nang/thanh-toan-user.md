# Chức năng: Thanh toán user (Checkout)

## 1) Mục tiêu chức năng
- Nhận dữ liệu sản phẩm cần mua từ 2 nguồn:
  - Mua ngay từ trang chi tiết sản phẩm.
  - Mua từ giỏ hàng.
- Cho user chọn địa chỉ giao hàng.
- Hỗ trợ thanh toán:
  - Tiền mặt (`tienmat`).
  - MoMo (`momo`).
- Tạo đơn hàng, trừ tồn kho, và xử lý điều hướng sau thanh toán.

## Bản mở rộng line-by-line
- Xem phụ lục chi tiết: [Phụ lục line-by-line toàn bộ chức năng](phu-luc-line-by-line-toan-bo-chuc-nang.md)

## 2) File liên quan

## Backend
- `src/routes/order.route.js`
- `src/controller/order.controller.js`
- `src/services/order.service.js`
- `src/dao/order.dao.js`
- `src/services/momo.service.js`
- `src/dao/address.dao.js`
- `src/dao/cart.dao.js`

## Frontend
- `fontend/pages/checkout/checkout.html`
- `fontend/pages/checkout/checkout.js`
- `fontend/pages/checkout/payment-success.html`
- `fontend/pages/checkout/payment-success.js`
- `fontend/assets/js/api.js`
- `fontend/assets/js/image.js`

---

## 3) Luồng tổng thể

1. User mở trang checkout.
2. `checkout.js` xác định mode:
   - `mode=buynow`: đọc `buy_now_item` từ localStorage.
   - Không có mode: đọc giỏ hàng từ API cart.
3. Frontend tải danh sách địa chỉ của user.
4. User chọn địa chỉ + phương thức thanh toán, bấm đặt hàng.
5. Frontend gửi `POST /api/orders`.
6. Backend tạo đơn:
   - lấy snapshot địa chỉ,
   - lấy danh sách item,
   - tính tiền,
   - tạo order và order items,
   - trừ tồn kho,
   - xóa cart nếu là luồng mua từ giỏ,
   - tạo phiên MoMo nếu chọn MoMo.
7. Frontend rẽ nhánh:
   - `tienmat`: hiển thị trạng thái thành công ngay trên trang checkout.
   - `momo`: redirect sang `payUrl` do backend trả về.
8. Sau khi thanh toán MoMo, trang `payment-success` gọi `POST /api/orders/momo/ipn` để backend cập nhật trạng thái thanh toán.

---

## 4) Backend chi tiết: route -> controller -> service -> dao

## 4.1 Route

Trong `order.route.js`:

```js
router.post('/', orderController.createOrder);
router.post('/momo/ipn', orderController.momoIpn);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);
```

Endpoint chính cho checkout là `POST /api/orders`.

## 4.2 Controller `createOrder`

Trong `order.controller.js`, controller đọc body:
- `user_id`
- `diachi_id`
- `ghichu`
- `phuongthuc_thanhtoan`
- `items` (optional, dùng cho mua ngay)

Rồi gọi:

```js
orderService.createOrder(nguoiDungId, diaChiId, ghiChu, phuongThucThanhToan, danhSachMuaNgay)
```

Ý nghĩa:
- Controller chỉ làm map HTTP request/response.
- Nghiệp vụ thật nằm ở service.

## 4.3 Service `createOrder` (trái tim nghiệp vụ)

Trong `order.service.js`, flow thực tế:

1. Chuẩn hóa phương thức thanh toán qua `chuanHoaPhuongThucThanhToan(...)`:
- `momo` hoặc `chuyenkhoan` -> chuẩn hóa thành `momo`.
- `tienmat` giữ nguyên.
- sai giá trị -> throw `400`.

2. Xác định nguồn dữ liệu đơn:
- Nếu có `checkoutItems` (mảng `items`) -> xem là mua ngay.
- Nếu không có `items` -> đọc từ cart bằng `cartDAO.getCartByUserId(userId)`.

3. Với mỗi item:
- validate `sanpham_id`, `soluong`.
- lấy snapshot sản phẩm bằng `orderDAO.getProductSnapshotForOrderItem(...)`.
- kiểm tra tồn kho biến thể.
- tính đơn giá (ưu tiên `giakhuyenmai` hợp lệ).

4. Lấy địa chỉ giao hàng:
- `addressDAO.getAddressById(addressId, userId)`.
- nếu không có -> throw `404`.

5. Tạo `snapshot_diachi` (JSON string) để lưu dấu vết địa chỉ tại thời điểm đặt.

6. Tính tổng:
- `tamTinh` từ danh sách item.
- `phiVanChuyen` hiện set `0` trong backend.
- `tongThanhToan = tamTinh + phiVanChuyen`.

7. Tạo đơn:
- `orderDAO.taoDonHang(...)`.
- `orderDAO.taoChiTietDonHang(...)`.
- `orderDAO.updateTonkho(...)` cho item có biến thể.
- `orderDAO.addLichSuDonHang(...)` trạng thái ban đầu `choxacnhan`.

8. Nếu đơn từ cart:
- `cartDAO.clearCart(userId)`.

9. Nếu phương thức là MoMo:
- gọi `taoPhienThanhToanMomo(...)`.
- hàm này gọi `momoService.taoThanhToan(...)` và trả `payUrl`.

10. Trả response data:
- `donhang_id`, `ma_donhang`, `tongthanhtoan`.
- nếu MoMo có thêm `payUrl`, `deeplink`, `qrCodeUrl`, `expired_time`.

## 4.4 `momoIpn` trong controller/service

Endpoint: `POST /api/orders/momo/ipn`.

Frontend `payment-success.js` gửi payload:

```json
{
  "orderId": "DH1700000000000",
  "resultCode": 0
}
```

Service `updateTrangThaiMOMO(orderId, resultCode)` cập nhật:
- `resultCode === 0` -> `dathanhtoan`.
- khác `0` -> `chuathanhtoan`.

---

## 5) Contract dữ liệu frontend gửi khi đặt hàng

## 5.1 Mua từ giỏ

```json
{
  "user_id": 3,
  "diachi_id": 2,
  "ghichu": "Giao giờ hành chính",
  "phuongthuc_thanhtoan": "tienmat"
}
```

Không gửi `items`; backend tự lấy từ cart.

## 5.2 Mua ngay

```json
{
  "user_id": 3,
  "diachi_id": 2,
  "ghichu": "",
  "phuongthuc_thanhtoan": "momo",
  "items": [
    {
      "sanpham_id": 1,
      "bienthe_id": 2,
      "soluong": 1
    }
  ]
}
```

Response thành công (rút gọn):

```json
{
  "success": true,
  "message": "Đặt hàng thành công!",
  "data": {
    "donhang_id": 101,
    "ma_donhang": "DH1700000000000",
    "tongthanhtoan": 350000,
    "payUrl": "https://test-payment.momo.vn/..."
  }
}
```

---

## 6) Frontend checkout chi tiết

## 6.1 `checkout.html`

Trang có các state chính:
- `#checkout-loading`
- `#checkout-not-logged`
- `#checkout-empty`
- `#checkout-content`
- `#checkout-success` (thành công COD hiển thị inline)

Các khối chức năng:
- hiển thị địa chỉ nhận hàng,
- modal chọn địa chỉ,
- danh sách sản phẩm checkout,
- ghi chú đơn,
- radio chọn phương thức thanh toán,
- nút đặt hàng.

## 6.2 `checkout.js`: hàm và luồng cụ thể

### A) `init()`

Khi `DOMContentLoaded`:

1. Lấy `user_id` từ localStorage.
2. Nếu chưa đăng nhập -> show `#checkout-not-logged`.
3. Gọi `loadAddresses()` để tải địa chỉ.
4. Đọc query `mode`.
5. Nếu `mode=buynow`:
- đọc `buy_now_item` từ localStorage,
- kiểm tra user hiện tại,
- gán `cartItems = [buyNowItem]`.
6. Nếu không có `buyNowItem`:
- gọi `GET /cart?user_id=...` để lấy dữ liệu từ giỏ.
7. Render item bằng `renderCheckoutItems(cartItems)`.
8. Cập nhật summary bằng `updateSummary()`.

### B) `loadAddresses()`

Gọi API:

```js
api.get(`/address?user_id=${userId}`)
```

Sau đó:
- chọn địa chỉ mặc định (`macdinh`) nếu có,
- nếu không có địa chỉ -> render trạng thái chưa có địa chỉ.

### C) `placeOrder()`

Khi user bấm đặt hàng:

1. Validate đã chọn địa chỉ.
2. Lấy `phuongthuc_thanhtoan` từ radio (`tienmat` hoặc `momo`).
3. Build payload:
- luôn có `user_id`, `diachi_id`, `ghichu`, `phuongthuc_thanhtoan`.
- chỉ thêm `items` nếu đang mua ngay.
4. Gọi `api.post('/orders', payload)`.
5. Nếu thành công:
- xóa `buy_now_item` khi đi theo luồng mua ngay.
- nếu MoMo có `payUrl` -> redirect ngay.
- nếu COD -> ẩn checkout content, hiện block success trong chính trang checkout.

### D) `updateSummary()`

Frontend hiển thị:
- `phiVanChuyen = 30000`.
- `tongCong = cartTotal + phiVanChuyen`.

Lưu ý: backend hiện tính `phivanchuyen = 0`, cần đồng bộ để tránh user thấy số tiền khác giữa UI và DB.

---

## 7) `payment-success.js` chi tiết

Mục đích chính của trang này là hiển thị kết quả trả về từ MoMo.

Flow:

1. `getPaymentResult()` đọc URL params:
- `orderId` hoặc `order_code`.
- `resultCode`.
- `message`.

2. `renderPaymentResult()`:
- build payload `{ orderId, resultCode }`.
- gọi `api.post('/orders/momo/ipn', payload)` để backend cập nhật trạng thái thanh toán.
- đổi UI success/failed theo `resultCode`.
- hiển thị mã đơn.

---

## 8) So sánh 4 nhánh nghiệp vụ

| Nguồn dữ liệu | Thanh toán | Hành vi backend | Hành vi frontend |
|---|---|---|---|
| Buy now | Tiền mặt | Dùng `items` từ payload, tạo đơn, trừ tồn | Hiển thị success inline ở checkout |
| Buy now | MoMo | Dùng `items`, tạo đơn, trừ tồn, tạo `payUrl` | Redirect sang MoMo |
| Cart | Tiền mặt | Lấy item từ cart, tạo đơn, trừ tồn, clear cart | Hiển thị success inline ở checkout |
| Cart | MoMo | Lấy cart, tạo đơn, trừ tồn, clear cart, tạo `payUrl` | Redirect sang MoMo |

---

## 9) Sơ đồ gọi hàm rút gọn

```text
Checkout load
  -> init()
    -> loadAddresses()
    -> xác định buynow/cart
    -> renderCheckoutItems()
    -> updateSummary()

User bấm Đặt hàng
  -> placeOrder()
    -> api.post('/orders', payload)
      -> route -> controller -> orderService.createOrder -> dao
    -> if momo: redirect payUrl
    -> if tienmat: hiển thị success inline

MoMo quay về payment-success
  -> renderPaymentResult()
    -> api.post('/orders/momo/ipn', { orderId, resultCode })
    -> render trạng thái success/failed
```

---

## 10) Lưu ý bảo trì
1. Giá trị phương thức thanh toán frontend đang dùng là `tienmat`/`momo`, cần giữ đúng contract này khi sửa UI.
2. Endpoint callback đang dùng thực tế là `POST /api/orders/momo/ipn`.
3. Nên đưa cấu hình MoMo (access key, secret key, partner code, URL callback) về biến môi trường trước khi triển khai production.
4. Nên đồng bộ `phí ship` giữa frontend và backend để tránh chênh lệch tổng tiền.

## 11) Ghi chú thực tế theo code hiện tại
1. Frontend checkout/cart đang cộng phí vận chuyển `30000`, trong khi backend `order.service.createOrder` đặt `phiVanChuyen = 0`.
2. `payment-success.js` luôn gọi `POST /orders/momo/ipn` để cập nhật trạng thái theo `orderId/resultCode` đọc từ URL trả về.
3. Trong `order.controller.momoIpn`, nhánh catch chưa `return` sớm và response success có typo field `rusltcode`.