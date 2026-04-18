# Chức năng: Header user

## 1) Mục tiêu chức năng
- Render thanh header dùng chung cho đa số trang frontend.
- Hiển thị trạng thái đã đăng nhập/chưa đăng nhập.
- Cung cấp menu tài khoản (profile, địa chỉ, đơn hàng, giỏ hàng, quản trị với admin).
- Tìm kiếm sản phẩm realtime ngay trên header.

## 2) File liên quan
- `fontend/components/components.js`
- `fontend/assets/js/api.js`
- `fontend/assets/js/image.js`
- Các trang dùng component `<app-header></app-header>`.

---

## 3) Kiến trúc component thực tế

Header được viết bằng Custom Element:

```js
class AppHeader extends HTMLElement {
  connectedCallback() {
    // đọc localStorage, dựng HTML, bind events
  }
}

customElements.define('app-header', AppHeader);
```

Ý nghĩa:
- Chỉ cần đặt `<app-header></app-header>` trong HTML.
- Khi element mount, `connectedCallback()` tự chạy để render toàn bộ header.

---

## 4) Luồng render trong `connectedCallback()`

`connectedCallback()` xử lý theo thứ tự:

1. Đọc trạng thái từ localStorage:
- `isLoggedIn`
- `role`
- `username`
- `fullname`
- `avatar`

2. Nếu user là admin và đang ở trang không thuộc `/pages/admin/`:
- redirect thẳng sang `/pages/admin/index.html`.

3. Chuẩn bị các URL điều hướng:
- logo, profile, address, orders, cart, login, register.

4. Tạo `userHtml` theo trạng thái auth:
- đã login: hiển thị avatar + dropdown tài khoản.
- chưa login: hiển thị nút đăng nhập/đăng ký.

5. Gán `this.innerHTML` để render giao diện header.

6. Bind event:
- dropdown tài khoản,
- search realtime.

---

## 5) Dropdown tài khoản và đăng xuất

## 5.1 Mở/đóng dropdown

Sau khi render:
- click vào `#tai-khoan-dropdown-trigger` -> toggle class `hien-thi` cho menu.
- click ra ngoài -> đóng menu.
- nhấn `Escape` -> đóng menu.

## 5.2 Đăng xuất

Trong HTML dropdown, nút đăng xuất đang dùng inline:

```html
<a href="#" onclick="localStorage.clear(); location.reload();" class="dang-xuat">
```

Ý nghĩa:
- Xóa toàn bộ localStorage.
- Reload trang để header về trạng thái guest.

---

## 6) Tìm kiếm realtime: pipeline chi tiết

Trong `components.js`, phần search sử dụng các hàm chính:
- `timkiem(query)`
- `fillkq(products)`
- `khongcokq()`
- `anketqua()`

## 6.1 Nhập từ khóa

Event `input` trên `#search-input`:

1. Cập nhật `currentSearchQuery`.
2. Gọi `timkiem(currentSearchQuery)`.

## 6.2 Debounce

`timkiem(query)` có debounce 300ms:

```js
if (searchTimeout) clearTimeout(searchTimeout);
searchTimeout = setTimeout(async () => {
  const data = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=6`);
  ...
}, 300);
```

Ý nghĩa:
- giảm số lần gọi API khi user gõ liên tục.

## 6.3 Hiển thị trạng thái search

Trước khi gọi API:
- hiện `#search-results`.
- hiện loading `#search-loading`.

Khi có kết quả:
- `fillkq(products)` render danh sách item.

Khi không có kết quả hoặc lỗi:
- `khongcokq()` hiện khối empty state.

Khi query quá ngắn (`<2`) hoặc user click ra ngoài:
- `anketqua()` để ẩn kết quả.

## 6.4 Render item search trong `fillkq(products)`

Mỗi item gợi ý gồm:
- ảnh sản phẩm,
- tên sản phẩm,
- giá sale/giá gốc,
- link sang trang chi tiết:

```js
item.href = `/pages/product/productdetail.html?id=${product.sanpham_id}`;
```

---

## 7) Contract API search header dùng

| API | Method | Input | Output |
|---|---|---|---|
| `/api/products/search` | GET | query `q`, `limit` | `{ success, data: [...] }` |

Request thực tế trong header:

```text
GET /api/products/search?q=<keyword>&limit=6
```

---

## 8) Sơ đồ gọi hàm rút gọn

```text
HTML có <app-header>
  -> connectedCallback()
    -> đọc localStorage
    -> render this.innerHTML
    -> bind dropdown events
    -> bind search events

User gõ search
  -> timkiem(query)
    -> debounce 300ms
    -> api.get('/products/search?...')
    -> fillkq() hoặc khongcokq()
```

---

## 9) Lưu ý bảo trì
1. `components.js` đang chứa cả `AppHeader` và `AppFooter`; khi project lớn nên tách module.
2. Cơ chế logout hiện dùng `localStorage.clear()` nên có thể xóa luôn các key không liên quan auth.
3. Search realtime phụ thuộc field backend (`sanpham_id`, `tensanpham`, `giaban`, `giakhuyenmai`, `hinhanh`), khi đổi response cần cập nhật `fillkq()`.