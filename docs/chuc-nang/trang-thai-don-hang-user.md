# Chức năng: Trạng thái đơn hàng user

## 1) Mục tiêu chức năng
- Hiển thị danh sách đơn hàng của user theo trạng thái.
- Cho phép xem chi tiết từng đơn hàng.
- Cho phép hủy đơn khi còn trạng thái `choxacnhan`.
- Hiển thị trạng thái thanh toán và phương thức thanh toán.

## Bản mở rộng line-by-line
- Xem phụ lục chi tiết: [Phụ lục line-by-line toàn bộ chức năng](phu-luc-line-by-line-toan-bo-chuc-nang.md)

## 2) File liên quan

## Backend
- `src/routes/order.route.js`
- `src/controller/order.controller.js`
- `src/services/order.service.js`
- `src/dao/order.dao.js`

## Frontend
- `fontend/pages/profile/orders.html`
- `fontend/pages/profile/orders.js`
- `fontend/pages/profile/order-detail.html`
- `fontend/pages/profile/order-detail.js`
- `fontend/assets/js/api.js`
- `fontend/assets/js/image.js`

---

## 3) Luồng tổng thể

1. User mở trang danh sách đơn `orders.html`.
2. `orders.js` gọi `GET /api/orders?user_id=...` để lấy danh sách đơn cơ bản.
3. Với từng đơn, frontend gọi tiếp `GET /api/orders/:id?user_id=...` để lấy chi tiết sản phẩm (`chitiet`).
4. Frontend render danh sách, cho lọc theo tab trạng thái.
5. User có thể:
   - mở chi tiết đơn,
   - mở modal hủy đơn (nếu `choxacnhan`) và gửi `PATCH /api/orders/:id/cancel`.
6. Trang `order-detail.html` cũng gọi API chi tiết đơn và hỗ trợ hủy đơn tương tự.

---

## 4) Backend chi tiết: route -> controller -> service -> dao

## 4.1 Route

Trong `order.route.js`:

```js
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);
```

Ba endpoint này là phần chính cho tính năng trạng thái đơn hàng user.

## 4.2 Controller

`order.controller.js`:

1. `getOrders(req, res)`:
- nhận `user_id` từ query.
- thiếu `user_id` -> `400`.
- gọi `orderService.getOrders(user_id)`.

2. `getOrderById(req, res)`:
- nhận `id` từ params và `user_id` từ query.
- gọi `orderService.getOrderById(orderId, userId)`.

3. `cancelOrder(req, res)`:
- nhận `id` từ params.
- nhận `user_id`, `lydo_huy` từ body.
- gọi `orderService.cancelOrder(orderId, userId, lyDoHuy)`.

## 4.3 Service

`order.service.js`:

1. `getOrders(userId)`:
- gọi DAO `getDonHangCuaUser(userId)` trả danh sách đơn.

2. `getOrderById(orderId, userId)`:
- gọi DAO `getOrderById(orderId, userId)`.
- nếu không có đơn hợp lệ của user -> throw `404`.

3. `cancelOrder(orderId, userId, lydoHuy)`:
- kiểm tra đơn có thuộc user không (`getOrderRowForUser`).
- chỉ cho hủy khi `trangthai === 'choxacnhan'`.
- lấy danh sách item đơn hàng (`getOrderItems`).
- hoàn tồn kho cho từng biến thể (`restoreTonkho`).
- cập nhật đơn sang `dahuy` + lưu lý do (`cancelOrder`).
- ghi lịch sử trạng thái đơn (`addLichSuDonHang`).

## 4.4 DAO

`order.dao.js` cung cấp các hàm trọng tâm:

1. `getDonHangCuaUser(userId)`:
- trả danh sách đơn theo `createdAt DESC`.
- trả các field như `trangthai`, `trangthai_thanhtoan`, `phuongthuc_thanhtoan`, `tongthanhtoan`.

2. `getOrderById(orderId, userId)`:
- lấy đơn theo `id + user_id`.
- lấy thêm `chitiet` bằng join `chitietdonhang` + `sanpham` (để có ảnh hiển thị).

3. `getOrderRowForUser(orderId, userId)`:
- xác nhận quyền sở hữu đơn trước khi hủy.

4. `getOrderItems(orderId)` + `restoreTonkho(...)`:
- dùng để hoàn lại số lượng tồn khi user hủy đơn hợp lệ.

5. `cancelOrder(orderId, lydoHuy)`:

```sql
UPDATE donhang
SET trangthai = 'dahuy', lydo_huy = ?
WHERE id = ?
```

---

## 5) Contract API cho trạng thái đơn hàng

| API | Method | Input | Output |
|---|---|---|---|
| `/api/orders` | GET | query `user_id` | `{ success, data: [] }` |
| `/api/orders/:id` | GET | query `user_id` | `{ success, data: orderDetail }` |
| `/api/orders/:id/cancel` | PATCH | body `{ user_id, lydo_huy }` | `{ success, message }` |

Ví dụ hủy đơn:

```json
{
  "user_id": 3,
  "lydo_huy": "Thay đổi ý định mua hàng"
}
```

---

## 6) Frontend danh sách đơn (`orders.html` + `orders.js`)

## 6.1 Cấu trúc UI

`orders.html` có:
- dải tab lọc trạng thái `#order-tabs`:
  - all, choxacnhan, dangxuly, danggiao, dagiao, dahuy.
- trạng thái loading `#orders-loading`.
- empty state `#orders-empty`.
- vùng render danh sách `#orders-content`.

## 6.2 Flow load dữ liệu

`loadOrders()` trong `orders.js`:

1. gọi API danh sách:

```js
api.get(`/orders?user_id=${userId}`)
```

2. với mỗi đơn trong list, gọi tiếp API chi tiết:

```js
api.get(`/orders/${donhangId}?user_id=${userId}`)
```

3. ghép kết quả vào `allOrders`, sort giảm dần theo `createdAt`.
4. gọi `renderOrders()`.

## 6.3 Lọc theo trạng thái

`setActiveTab(status)` đổi `activeStatus` rồi render lại.

`matchStatus(order, status)` có rule đặc biệt:
- tab `dangxuly` sẽ hiển thị cả đơn `dangxuly` và `daxacnhan`.

## 6.4 Render thẻ đơn

`renderOrderCard(order)` hiển thị:
- mã đơn,
- phương thức thanh toán,
- trạng thái đơn,
- danh sách sản phẩm (`renderProducts`).

Nếu đơn `choxacnhan` thì có thêm:
- nút mở modal hủy,
- form nhập lý do hủy.

## 6.5 Hủy đơn từ list

`submitCancelOrder(formElement)`:
1. lấy `orderId` + `lydo`.
2. gọi:

```js
api.patch(`/orders/${orderId}/cancel`, {
  user_id: userId,
  lydo_huy: lydo
})
```

3. thành công -> đóng modal và `loadOrders()` lại.

---

## 7) Frontend chi tiết đơn (`order-detail.html` + `order-detail.js`)

## 7.1 Flow load chi tiết

`loadOrderDetail()`:
1. lấy `donhang_id` từ query string.
2. gọi:

```js
api.get(`/orders/${orderId}?user_id=${userId}`)
```

3. render các phần:
- header đơn (`updateHeader`),
- danh sách sản phẩm (`renderProducts`),
- snapshot địa chỉ giao hàng (`renderAddress`),
- thanh toán (`renderPayment`),
- ghi chú (`renderNote`),
- thông tin hủy (`renderCancelledInfo`).

## 7.2 Nút hủy đơn trong trang chi tiết

`bindCancelButton(orderId, currentStatus)`:
- chỉ hiện nút khi trạng thái `choxacnhan`.
- khi click:
  - prompt nhập lý do,
  - gọi `PATCH /orders/:id/cancel`,
  - thành công thì load lại chi tiết.

---

## 8) Mapping trạng thái hiển thị

Trong frontend có mapping text:

| Mã trạng thái | Text |
|---|---|
| `choxacnhan` | Chờ xác nhận |
| `daxacnhan` | Đã xác nhận |
| `dangxuly` | Đang xử lý |
| `danggiao` | Đang giao hàng |
| `dagiao` | Hoàn thành |
| `dahuy` | Đã hủy |

Trạng thái thanh toán dùng `trangthai_thanhtoan`:
- `dathanhtoan` -> Đã thanh toán.
- khác giá trị này -> Chưa thanh toán.

---

## 9) Sơ đồ gọi hàm rút gọn

```text
Orders page load
  -> loadOrders()
    -> api.get('/orders?user_id=...')
    -> for each order: api.get('/orders/:id?user_id=...')
    -> renderOrders()

User hủy đơn ở list/detail
  -> api.patch('/orders/:id/cancel', { user_id, lydo_huy })
    -> route -> controller -> orderService.cancelOrder -> orderDAO
    -> update trangthai = dahuy + restore tồn kho
```

---

## 10) Lưu ý bảo trì
1. Frontend đang gọi N+1 request cho trang list đơn (1 list + nhiều detail), có thể tối ưu bằng API list trả luôn item tóm tắt.
2. Luồng hủy đơn đã hoàn tồn kho cho biến thể; cần giữ nhất quán khi thêm trạng thái mới hoặc thêm rule tồn kho.
3. Tab `dangxuly` đang gom cả `daxacnhan`; nếu đổi quy ước nghiệp vụ cần cập nhật hàm `matchStatus`.

## 11) Ghi chú thực tế theo code hiện tại
1. `orders.js` đang load list đơn rồi gọi thêm detail cho từng đơn bằng `Promise.all`, gây mô hình N+1 request.
2. Hủy đơn chỉ được phép ở trạng thái `choxacnhan`; service sẽ hoàn tồn kho cho các item có `bienthe_id`.
3. API chi tiết đơn yêu cầu query `user_id`; thiếu tham số này controller trả `400`.