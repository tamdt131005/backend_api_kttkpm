# Chức năng: Giỏ hàng

## 1) Mục tiêu chức năng
- Hiển thị danh sách sản phẩm đã thêm vào giỏ.
- Cho phép tăng/giảm số lượng từng item.
- Cho phép xóa item khỏi giỏ.
- Tính tạm tính/tổng cộng để chuyển sang checkout.

## 2) File liên quan

## Backend
- `src/routes/cart.route.js`
- `src/controller/cart.controller.js`
- `src/services/cart.service.js`
- `src/dao/cart.dao.js`

## Frontend
- `fontend/pages/cart/index.html`
- `fontend/pages/cart/cart.js`
- `fontend/assets/js/api.js`
- `fontend/assets/js/image.js`

---

## 3) Luồng chạy tổng thể

1. User mở trang `/pages/cart/index.html`.
2. `cart.js` chạy `loadCart()` khi `DOMContentLoaded`.
3. `loadCart()` gọi `GET /api/cart?user_id=...`.
4. Backend xử lý route -> controller -> service -> dao -> DB.
5. Frontend nhận dữ liệu và render:
    - danh sách item,
    - tổng tiền.
6. Khi user thao tác tăng/giảm/xóa:
    - gọi API update/delete,
    - sau đó gọi lại `loadCart()` để render lại toàn bộ.

---

## 4) Backend chi tiết: hàm nào gọi hàm nào

## 4.1 Route

Trong `cart.route.js`:

```js
router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);
```

Ý nghĩa:
- 4 endpoint CRUD cho giỏ hàng.

## 4.2 Controller

Controller `getCart`:

```js
async getCart(req, res) {
   const userId = req.query.user_id;
   if (!userId) return res.status(400).json({ success: false, message: 'Thiếu user_id' });

   const data = await cartService.getCart(userId);
   return res.status(200).json({ success: true, message: 'Lấy giỏ hàng thành công', data });
}
```

Controller `addToCart`:
- Kiểm tra `user_id`, `sanpham_id` có tồn tại.
- Gọi service thêm item.

Controller `updateCartItem`:
- Lấy `cartId` từ `req.params.id`.
- Lấy `user_id`, `soluong` từ body.
- Gọi service update số lượng.

Controller `removeCartItem`:
- Lấy `cartId` từ params, `user_id` từ query.
- Gọi service xóa item.

## 4.3 Service

Trong `cart.service.js`:

```js
async getCart(userId) {
   const items = await cartDAO.getCartByUserId(userId);
   const tongtien = await cartDAO.getCartTotal(userId);
   return { items, tongtien };
}
```

`addToCart`:
- Gọi `findCartItem(userId, sanphamId)`.
- Nếu đã có item -> throw `400`.
- Nếu chưa có -> `addToCart(...)`.

`updateCartItem`:
- Validate `soluong > 0`.
- Gọi DAO `updateQuantity(...)`.
- Nếu không ảnh hưởng dòng nào -> throw `404`.

`removeCartItem`:
- Gọi DAO `removeCartItem(...)`.
- Nếu không ảnh hưởng dòng nào -> throw `404`.

## 4.4 DAO

Trong `cart.dao.js` các hàm chính:

1. `getCartByUserId(userId)`
- Join `giohang`, `sanpham`, `bienthesp`.
- Trả các field dùng để render cart item.

2. `getCartTotal(userId)`
- Tính tổng theo công thức:
   - nếu có `giakhuyenmai` hợp lệ -> lấy giá KM,
   - ngược lại lấy `giaban`.

3. `addToCart(...)`
- Insert item vào `giohang`.

4. `updateQuantity(...)`
- Update `soluong` theo `id` + `user_id`.

5. `removeCartItem(...)`
- Delete item theo `id` + `user_id`.

---

## 5) Input/Output API

| API | Method | Input | Output |
|---|---|---|---|
| `/api/cart` | GET | query `user_id` | `{ success, data: { items, tongtien } }` |
| `/api/cart` | POST | `user_id, sanpham_id, bienthe_id?, soluong` | `{ success, data: { giohang_id } }` |
| `/api/cart/:id` | PUT | body `user_id, soluong` | `{ success, message }` |
| `/api/cart/:id` | DELETE | query `user_id` | `{ success, message }` |

Ví dụ response `GET /api/cart` (rút gọn):

```json
{
   "success": true,
   "data": {
      "items": [
         {
            "giohang_id": 10,
            "sanpham_id": 1,
            "tensanpham": "Áo thun basic đen",
            "giaban": 200000,
            "giakhuyenmai": 150000,
            "soluong": 2,
            "kichthuoc": "M",
            "mausac": "Đen"
         }
      ],
      "tongtien": 300000
   }
}
```

---

## 6) Frontend HTML: trang cart viết gì

Trong `pages/cart/index.html` có 4 state:

1. `#cart-loading` -> đang tải dữ liệu.
2. `#cart-not-logged` -> chưa đăng nhập.
3. `#cart-empty` -> giỏ trống.
4. `#cart-content` -> có dữ liệu, gồm:
    - `#cart-items` (danh sách item render bằng JS)
    - summary (`#item-count`, `#subtotal`, `#total`)
    - nút sang checkout.

---

## 7) Frontend JS: render và thao tác chi tiết

## 7.1 Hàm `loadCart()` (điểm vào chính)

```js
async function loadCart() {
   const userId = getUserId();
   if (!userId) {
      // show state chưa đăng nhập
      return;
   }

   const res = await api.get(`/cart?user_id=${userId}`);
   if (res.success) renderCart(res.data);
}
```

Tác dụng:
- Hàm này tải toàn bộ dữ liệu giỏ từ backend.
- Được gọi khi trang vừa load và sau mỗi thao tác update/xóa.

## 7.2 Hàm `renderCart(data)`

`data` có dạng `{ items, tongtien }`.

Bước xử lý:
1. Ẩn loading state.
2. Nếu `items` rỗng -> hiện state giỏ trống.
3. Nếu có item:
    - render từng item bằng `renderCartItem(item)`.
    - gán HTML vào `#cart-items`.
4. Tính tổng hiển thị:
    - `phiVanChuyen = 30000` (frontend đang hard-code)
    - `tongCong = tongtien + phiVanChuyen`
5. Cập nhật text cho `#item-count`, `#subtotal`, `#total`.

## 7.3 Hàm `renderCartItem(item)`

Hàm này nhận 1 item và dựng HTML card dòng giỏ hàng:
- ảnh sản phẩm,
- tên sản phẩm,
- biến thể (size/màu),
- giá hiện tại và giá gốc,
- nút giảm/tăng số lượng,
- nút xóa.

Nút trong HTML item gọi trực tiếp:
- `updateQuantity(giohang_id, newQty)`
- `removeItem(giohang_id)`

## 7.4 Hàm `updateQuantity(cartId, newQty)`

```js
const res = await api.put(`/cart/${cartId}`, {
   user_id: Number(userId),
   soluong: newQty
});
if (res.success) await loadCart();
```

Tác dụng:
- Gửi số lượng mới lên backend.
- Nếu thành công, tải lại toàn bộ giỏ để UI đồng bộ.

## 7.5 Hàm `removeItem(cartId)`

```js
const res = await api.delete(`/cart/${cartId}?user_id=${userId}`);
if (res.success) await loadCart();
```

Tác dụng:
- Xóa item khỏi DB.
- Reload lại giỏ để cập nhật màn hình.

---

## 8) Sơ đồ gọi hàm rút gọn

```text
DOMContentLoaded
   -> loadCart()
      -> api.get('/cart?user_id=...')
         -> backend route/controller/service/dao
      -> renderCart(data)
         -> items.map(renderCartItem)

User bấm +/-
   -> updateQuantity(cartId, qty)
      -> api.put('/cart/:id')
      -> loadCart()

User bấm Xóa
   -> removeItem(cartId)
      -> api.delete('/cart/:id?user_id=...')
      -> loadCart()
```

---

## 9) Lưu ý bảo trì
1. Service đang kiểm tra trùng theo `user_id + sanpham_id`, chưa tách theo biến thể.
2. Phí ship ở frontend cart là `30.000`, trong khi backend order hiện có logic khác; cần đồng bộ để không lệch tổng tiền hiển thị.
3. Nên thêm debounce hoặc lock nút khi user bấm tăng/giảm liên tục để tránh spam request.
