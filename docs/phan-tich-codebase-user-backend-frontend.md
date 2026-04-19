# Tài liệu phân tích codebase (Backend + Frontend)

## 1) Mục tiêu tài liệu
Tài liệu này giải thích chi tiết logic hệ thống hiện tại cho các chức năng bạn yêu cầu:
- Đăng ký, đăng nhập.
- Khu vực user: trang chủ, chi tiết sản phẩm, giỏ hàng, header user, profile, địa chỉ, trạng thái đơn hàng.
- Thanh toán user: mua ngay và mua từ giỏ hàng; thanh toán tiền mặt và MoMo.
- Backend theo luồng route -> middleware/validation -> controller -> service -> dao.
- Frontend theo file HTML/JS, cách render, API nào được gọi, dữ liệu truyền vào.

## Tài liệu tách theo chức năng
- [Đăng ký và đăng nhập](chuc-nang/dang-ky-dang-nhap.md)
- [Trang chủ user](chuc-nang/trang-chu-user.md)
- [Chi tiết sản phẩm](chuc-nang/chi-tiet-san-pham.md)
- [Giỏ hàng](chuc-nang/gio-hang.md)
- [Header user](chuc-nang/header-user.md)
- [Profile user](chuc-nang/profile-user.md)
- [Địa chỉ user](chuc-nang/dia-chi-user.md)
- [Trạng thái đơn hàng user](chuc-nang/trang-thai-don-hang-user.md)
- [Thanh toán user (mua ngay, từ giỏ, COD, MoMo)](chuc-nang/thanh-toan-user.md)
- [Phụ lục line-by-line toàn bộ chức năng](chuc-nang/phu-luc-line-by-line-toan-bo-chuc-nang.md)

Ghi chú: phụ lục line-by-line đã được mở rộng theo hướng function-level, có thêm ma trận nhánh lỗi và các điểm cần lưu ý theo code hiện tại.

Phạm vi phân tích dựa trên mã nguồn hiện tại trong repo, không suy diễn thêm ngoài code.

---

## 2) Tổng quan kiến trúc

### 2.1 Backend tổng quan
Entry point backend là `index.js`, mount các nhóm route:
- `/api/auth`
- `/api/products`
- `/api/cart`
- `/api/address`
- `/api/orders`
- `/api/profile`
- `/api/admin`

Luồng xử lý chính của hệ thống user-facing:
1. Route nhận request.
2. Nếu có validation Joi thì chạy ở layer route qua middleware `validateRequest`.
3. Controller nhận dữ liệu từ `req`, kiểm tra thiếu dữ liệu cơ bản, gọi Service.
4. Service xử lý nghiệp vụ.
5. DAO thực hiện query SQL qua pool MySQL (`mysql2/promise`).
6. Controller trả response JSON dạng `{ success, message, data }` (hoặc biến thể tương tự).

Lưu ý kiến trúc hiện tại:
- Chưa có middleware auth JWT áp cho các route user. Nhiều API dùng `user_id` truyền trực tiếp query/body.
- Validation có ở auth/product/address/profile; cart/order chủ yếu kiểm tra thủ công trong controller/service.

### 2.2 Frontend tổng quan
Frontend là thư mục `fontend` (đúng theo tên hiện tại trong repo), hoạt động kiểu multi-page + vanilla JS:
- Script dùng chung:
  - `fontend/assets/js/api.js`: helper gọi API backend.
  - `fontend/assets/js/image.js`: chuẩn hóa đường dẫn ảnh.
  - `fontend/components/components.js`: custom element `app-header`, `app-footer` và logic search header.
- Mỗi trang có HTML + JS riêng (auth, cart, checkout, product detail...).

---

## 3) Backend: chi tiết theo chức năng

## 3.1 Cấu hình và hạ tầng backend

### File `src/config/config.json`
- Chứa cấu hình DB theo môi trường `development`, `test`, `production`.
- Môi trường local hiện dùng DB `btapweb_v2`, host `127.0.0.1`, user `root`, password null.

### File `src/config/db.js`
- Đọc config JSON và tạo MySQL connection pool.
- Export `pool` dùng chung cho tất cả DAO.
- Khi khởi động app, thử `pool.getConnection()` để log trạng thái kết nối DB.

### File `index.js`
Vai trò:
- Khởi tạo Express app.
- Gắn middleware chung `cors()`, `express.json()`.
- Public static file ảnh upload: `/upload/img` -> `src/upload/img`.
- Mount toàn bộ route API.
- Start server ở port `3000`.

---

## 3.2 Middleware và validation

### File `src/middlewares/validate.middleware.js`
Hàm chính:
- `validateRequest(schema, property = 'body')`

Tác dụng:
- Chạy Joi validation cho `req.body` hoặc `req.params`.
- Nếu lỗi: trả `400` với JSON:
  - `success: false`
  - `message: "Dữ liệu đầu vào không hợp lệ"`
  - `errors: [...]` (mảng chi tiết lỗi Joi)
- Nếu hợp lệ: `next()`.

### File `src/validation/auth.validate.js`
- `signupSchema`:
  - `username`: string 3-50, required
  - `password`: string 6-50, required
  - `fullname`: optional
  - `email`: email hợp lệ, required
- `signinSchema`:
  - `username`, `password` required
- Export middleware:
  - `validateSignup`
  - `validateSignin`

### File `src/validation/product.validate.js`
- `validateProductId`: validate `req.params.id` là số nguyên dương.
- `validateCategoryId`: validate `req.params.category_id` là số nguyên dương.

### File `src/validation/address.validate.js`
- Validate tạo/sửa địa chỉ gồm: `user_id`, `tennguoinhan`, `sodienthoai`, `diachichitiet`, `phuong`, `quan`, `tinh`, `macdinh`.
- `sodienthoai` theo regex số VN `^0[0-9]{9}$`.

### File `src/validation/profile.validate.js`
- Validate cập nhật profile:
  - `id`, `email` bắt buộc.
  - `fullname`, `phone`, `sex`, `ngaysinh`, `avatar` cho phép null.

---

## 3.3 Chức năng Đăng ký / Đăng nhập

### Danh sách file liên quan
- `src/routes/auth.route.js`
- `src/validation/auth.validate.js`
- `src/controller/auth.controller.js`
- `src/services/auth.service.js`
- `src/dao/auth.dao.js`

### Luồng xử lý đăng ký
1. Client gọi `POST /api/auth/signup`.
2. Route chạy `validateSignup`.
3. Controller `signup(req, res)` lấy `username, password, fullname, email`.
4. Service `signup(...)`:
   - Kiểm tra username đã tồn tại (`authDao.getUserByUsername`).
   - Kiểm tra email đã tồn tại (`authDao.getUserByEmail`).
   - Hash password bằng `bcrypt.genSalt(10)` + `bcrypt.hash`.
   - Tạo user (`authDao.createUser`).
5. Controller trả:
   - Success: `201`, `{ success: true, message: "Đăng ký tài khoản thành công!" }`
   - Lỗi: status theo `error.status` (thường 409/500), `{ success: false, message }`

### Luồng xử lý đăng nhập
1. Client gọi `POST /api/auth/signin`.
2. Route chạy `validateSignin`.
3. Controller `signin(req, res)` lấy `username, password`.
4. Service `signin(...)`:
   - Tìm user theo username.
   - So sánh password bằng `bcrypt.compare`.
   - Trả object user rút gọn:
     - `id`, `username`, `fullname`, `role`, `avatar`.
5. Controller trả:
   - Success: `200`, `{ success: true, message: "Đăng nhập thành công!", user }`
   - Lỗi: 404 (không tồn tại), 400 (sai mật khẩu), hoặc 500.

### SQL/DAO auth
- `createUser`: INSERT vào `users` với role mặc định `'user'`.
- `getUserByUsername`: SELECT theo username.
- `getUserByEmail`: SELECT theo email.

---

## 3.4 Chức năng Trang chủ user / tìm kiếm / chi tiết sản phẩm

### Danh sách file backend liên quan
- `src/routes/product.route.js`
- `src/validation/product.validate.js`
- `src/controller/user.productsController.js`
- `src/services/product.service.js`
- `src/dao/user.productsDao.js`

### API và luồng xử lý

### 1) Lấy danh sách sản phẩm trang chủ
- Endpoint: `GET /api/products`
- Route -> Controller `index` -> Service `getAllProducts` -> DAO `getAllProducts`
- DAO query:
  - Join `sanpham`, `bienthesp`, `danhgia`
  - Chỉ lấy `sp.an_hien = 1`, `deleted_at IS NULL`
  - Tính `tong_soluong`, `diem_danhgia`, `luot_danhgia`
  - Limit 8 sản phẩm mới nhất
- Response:
  - `200`, `{ success: true, message, data: [ ... ] }`

### 2) Tìm kiếm sản phẩm (header search)
- Endpoint: `GET /api/products/search?q=...&limit=...`
- Controller `search` lấy query param `q`, `limit`.
- Service `searchProducts`:
  - Nếu keyword rỗng -> trả `[]`
  - Giới hạn `limit` tối đa 20 (mặc định 6)
- DAO `searchProducts`:
  - Tìm theo `tensanpham`, `slug`, `thuonghieu`
  - Sắp xếp ưu tiên tên bắt đầu bằng keyword
- Response:
  - `200`, `{ success: true, message, data: [ ... ] }`

### 3) Chi tiết sản phẩm
- Endpoint: `GET /api/products/:id`
- Validation: `validateProductId`
- Controller `productDetail` -> Service `getProductById` -> DAO `getProductById`
- DAO lấy:
  - Thông tin sản phẩm + danh mục + điểm đánh giá + tổng tồn
  - Danh sách biến thể từ `bienthesp`
  - Danh sách ảnh phụ từ `hinhanh_sanpham`
- Service nếu không tìm thấy -> throw `{ status: 404, message: "Không tìm thấy sản phẩm" }`
- Response thành công:
  - `{ success: true, message, data: { ...product, bienthe: [...], hinhanh_phu: [...] } }`

### 4) Sản phẩm theo danh mục
- Endpoint: `GET /api/products/category/:category_id`
- Validation: `validateCategoryId`
- Service gọi DAO `getProductsByCategoryId`.

---

## 3.5 Chức năng Giỏ hàng

### Danh sách file backend liên quan
- `src/routes/cart.route.js`
- `src/controller/cart.controller.js`
- `src/services/cart.service.js`
- `src/dao/cart.dao.js`

### API giỏ hàng

### 1) Lấy giỏ hàng
- Endpoint: `GET /api/cart?user_id=...`
- Controller kiểm tra `user_id`.
- Service `getCart` gọi:
  - DAO `getCartByUserId` (danh sách item)
  - DAO `getCartTotal` (tổng tiền)
- Response:
  - `{ success: true, data: { items: [...], tongtien } }`

### 2) Thêm vào giỏ
- Endpoint: `POST /api/cart`
- Input body:
  - `user_id`, `sanpham_id`, `bienthe_id` (nullable), `soluong`
- Controller kiểm tra thiếu `user_id` hoặc `sanpham_id`.
- Service `addToCart`:
  - Gọi DAO `findCartItem(userId, sanphamId)`
  - Nếu đã tồn tại: throw 400 `"Sản phẩm đã có trong giỏ hàng"`
  - Nếu chưa có: DAO `addToCart`
- Response:
  - `201`, `{ success: true, data: { giohang_id } }`

### 3) Cập nhật số lượng
- Endpoint: `PUT /api/cart/:id`
- Input body: `user_id`, `soluong`
- Service kiểm tra `soluong > 0`, cập nhật DAO `updateQuantity`.

### 4) Xóa item
- Endpoint: `DELETE /api/cart/:id?user_id=...`
- Service gọi DAO `removeCartItem`.

### SQL/DAO cart
- `getCartByUserId`: join `giohang`, `sanpham`, `bienthesp`.
- `getCartTotal`: sum tiền theo giá khuyến mãi nếu hợp lệ.
- `clearCart`: xóa toàn bộ giỏ theo user (dùng sau khi checkout từ giỏ).

---

## 3.6 Chức năng Thanh toán / Đơn hàng (mua ngay, mua từ giỏ, COD, MoMo)

### Danh sách file backend liên quan
- `src/routes/order.route.js`
- `src/controller/order.controller.js`
- `src/services/order.service.js`
- `src/dao/order.dao.js`
- `src/services/momo.service.js`
- `src/dao/address.dao.js` (đọc địa chỉ khi tạo đơn)
- `src/dao/cart.dao.js` (đọc/xóa giỏ khi tạo đơn từ giỏ)

### API order
- `POST /api/orders` tạo đơn hàng.
- `POST /api/orders/momo/ipn` cập nhật trạng thái thanh toán MoMo.
- `GET /api/orders?user_id=...` danh sách đơn.
- `GET /api/orders/:id?user_id=...` chi tiết đơn.
- `PATCH /api/orders/:id/cancel` hủy đơn.

### Luồng tạo đơn hàng chi tiết (hàm `OrderService.createOrder`)

Input từ controller:
- `user_id`
- `diachi_id`
- `ghichu`
- `phuongthuc_thanhtoan` (`tienmat`, `momo`, `chuyenkhoan`)
- `items` (optional, nếu có nghĩa là mua ngay)

Bước xử lý:
1. Chuẩn hóa phương thức thanh toán:
   - `momo` hoặc `chuyenkhoan` -> chuẩn nội bộ là `momo`.
   - `tienmat` giữ nguyên.
2. Xác định nhánh checkout:
   - Nếu có `items` và mảng không rỗng -> nhánh mua ngay.
   - Ngược lại -> nhánh mua từ giỏ hàng.
3. Nhánh mua ngay:
   - Duyệt từng item, validate `sanpham_id`, `soluong`.
   - Đọc snapshot sản phẩm qua DAO `getProductSnapshotForOrderItem`.
   - Nếu có `bienthe_id` thì check tồn kho.
   - Tính đơn giá theo giá khuyến mãi nếu có.
4. Nhánh mua từ giỏ:
   - Đọc tất cả item từ `cartDAO.getCartByUserId(userId)`.
   - Tính đơn giá/tạm tính theo từng dòng giỏ.
5. Kiểm tra địa chỉ nhận hàng:
   - `addressDAO.getAddressById(addressId, userId)`.
   - Lưu `snapshot_diachi` dạng JSON string vào đơn.
6. Tạo đơn:
   - `ma_donhang = DH + Date.now()`.
   - `phivanchuyen` hiện hard-code = 0 ở service.
   - Gọi DAO `taoDonHang`, `taoChiTietDonHang`.
7. Trừ tồn kho biến thể (nếu có `bienthe_id`) bằng `updateTonkho`.
8. Ghi lịch sử đơn (`addLichSuDonHang`, trạng thái `choxacnhan`).
9. Nếu là nhánh từ giỏ -> xóa giỏ (`cartDAO.clearCart`).
10. Nếu thanh toán MoMo:
   - Gọi `taoPhienThanhToanMomo` -> `momoService.taoThanhToan`.
   - Trả thêm `payUrl`, `deeplink`, `qrCodeUrl`, `expired_time`.

Output thành công:
- `data` gồm:
  - `donhang_id`
  - `ma_donhang`
  - `tongthanhtoan`
  - Nếu MoMo: thêm `payUrl`...

### Nhánh thanh toán tiền mặt (COD)
- `phuongthuc_thanhtoan = tienmat`.
- Service vẫn tạo đơn + chi tiết + trừ kho + lịch sử.
- Không tạo link thanh toán.
- Controller trả thành công ngay, frontend hiển thị màn "Đặt hàng thành công".

### Nhánh thanh toán MoMo
- `phuongthuc_thanhtoan = momo` hoặc `chuyenkhoan`.
- Service gọi MoMo gateway để lấy `payUrl`.
- Frontend nhận `payUrl` và redirect sang cổng MoMo.
- Sau thanh toán, trang `payment-success.html` gọi lại `POST /api/orders/momo/ipn` để cập nhật trạng thái.

### Cập nhật trạng thái thanh toán MoMo
- Controller `momoIpn` lấy `orderId`, `resultCode`.
- Service `updateTrangThaiMOMO`:
  - `resultCode == 0` -> set `trangthai_thanhtoan = dathanhtoan`.
  - Khác 0 -> set `trangthai_thanhtoan = chuathanhtoan`.

### Hủy đơn hàng
- API: `PATCH /api/orders/:id/cancel` body `{ user_id, lydo_huy }`.
- Chỉ cho hủy khi trạng thái đơn hiện tại là `choxacnhan`.
- Khi hủy:
  - Hoàn lại tồn kho biến thể (`restoreTonkho`).
  - Update đơn sang `dahuy`.
  - Ghi lịch sử đơn.

---

## 3.7 Address và Profile (phục vụ checkout + header user)

### Address backend
File liên quan:
- `src/routes/address.route.js`
- `src/controller/address.controller.js`
- `src/services/address.service.js`
- `src/dao/address.dao.js`
- `src/validation/address.validate.js`

API chính:
- `POST /api/address` tạo địa chỉ.
- `PATCH /api/address` đặt mặc định.
- `GET /api/address?user_id=...` lấy danh sách địa chỉ user.
- `GET /api/address/:id` lấy 1 địa chỉ.
- `PUT /api/address/:id` cập nhật.
- `DELETE /api/address/:id` xóa (DAO chỉ xóa khi `macdinh = 0`).

Dùng trong checkout:
- Frontend checkout gọi `GET /api/address?user_id=...` để hiển thị/chọn địa chỉ nhận hàng.

### Profile backend
File liên quan:
- `src/routes/profile.route.js`
- `src/controller/profile.controller.js`
- `src/services/profile.service.js`
- `src/dao/profile.dao.js`
- `src/validation/profile.validate.js`

API chính:
- `GET /api/profile/:id` lấy profile.
- `PUT /api/profile` cập nhật profile.
- `POST /api/profile/avatar` upload avatar (multer, giới hạn 2MB).

Dùng cho header:
- Header hiện đọc avatar/name từ localStorage, dữ liệu này thường được set sau đăng nhập hoặc cập nhật profile.

---

## 3.8 Bảng input/output API (user-facing)

| Endpoint | Method | Input chính | Validation | Output chính |
|---|---|---|---|---|
| /api/auth/signup | POST | body: username, password, fullname?, email | Joi signup | success/message |
| /api/auth/signin | POST | body: username, password | Joi signin | success/message/user |
| /api/products | GET | none | none | data: danh sách sản phẩm trang chủ |
| /api/products/search | GET | query: q, limit | none | data: danh sách gợi ý tìm kiếm |
| /api/products/:id | GET | params: id | Joi params id | data: chi tiết sản phẩm + biến thể |
| /api/cart | GET | query: user_id | kiểm tra trong controller | data: items + tongtien |
| /api/cart | POST | body: user_id, sanpham_id, bienthe_id?, soluong | kiểm tra thủ công | data: giohang_id |
| /api/cart/:id | PUT | params: id, body: user_id, soluong | kiểm tra thủ công | success/message |
| /api/cart/:id | DELETE | params: id, query: user_id | kiểm tra thủ công | success/message |
| /api/address | GET | query: user_id | kiểm tra thủ công | data: danh sách địa chỉ |
| /api/orders | POST | body: user_id, diachi_id, ghichu, phuongthuc_thanhtoan, items? | kiểm tra thủ công + service | data: donhang_id, ma_donhang, tongthanhtoan, payUrl? |
| /api/orders/momo/ipn | POST | body: orderId, resultCode | kiểm tra trong service | success/message |
| /api/orders | GET | query: user_id | kiểm tra controller | data: danh sách đơn |
| /api/orders/:id | GET | params: id, query: user_id | kiểm tra controller | data: chi tiết đơn |
| /api/orders/:id/cancel | PATCH | params: id, body: user_id, lydo_huy | kiểm tra controller/service | success/message |

---

## 4) Frontend: chi tiết theo file và chức năng

## 4.1 File dùng chung frontend

### File `fontend/assets/js/api.js`
Vai trò:
- Khai báo `BASE_URL = http://localhost:3000/api`.
- Tạo helper chung:
  - `api.get`, `api.post`, `api.put`, `api.patch`, `api.delete`, `api.upload`.
- Tự thêm `Authorization` nếu localStorage có `token` (nhưng luồng hiện tại đăng nhập không set token).
- Parse JSON response, ném exception khi lỗi server (>=500).

### File `fontend/assets/js/image.js`
Vai trò:
- Chuẩn hóa URL ảnh sản phẩm/avatar/logo.
- `imageUtil.product(filename)`:
  - Ưu tiên ảnh từ backend `/upload/img/product/...`
- `imageUtil.avatar(filename)`:
  - fallback avatar mặc định `/assets/images/user.webp`.

### File `fontend/components/components.js` (Header user + Footer)
Chứa custom elements:
- `AppHeader`
- `AppFooter`

Logic chính của `AppHeader`:
1. Đọc localStorage:
   - `isLoggedIn`, `role`, `username`, `fullname`, `avatar`.
2. Nếu user đăng nhập và role admin nhưng đang ở trang user -> redirect admin page.
3. Render header:
   - Logo.
   - Form search + dropdown kết quả.
   - Khu vực user:
     - Nếu đã đăng nhập: avatar + menu dropdown (profile, địa chỉ, đơn hàng, giỏ hàng, đăng xuất).
     - Nếu chưa đăng nhập: nút đăng nhập/đăng ký.
4. Search live:
   - Bắt input, debounce 300ms.
   - Gọi API `GET /products/search?q=...&limit=6`.
   - Render danh sách gợi ý.

---

## 4.2 Chức năng Đăng nhập / Đăng ký frontend

### Danh sách file
- `fontend/pages/auth/login.html`
- `fontend/pages/auth/register.html`
- `fontend/pages/auth/auth.js`

### Cấu trúc HTML

`login.html`:
- Form `#loginForm` gồm `username`, `password`.
- Khu vực hiển thị lỗi `#login-error`.
- Nút submit đăng nhập.
- Nạp scripts: `api.js` + `auth.js`.

`register.html`:
- Form `#registerForm` gồm `username`, `email`, `password`, `confirm_password`.
- Khu vực lỗi `#register-error`, thành công `#register-success`.
- Nạp scripts: `api.js` + `auth.js`.

### JS `auth.js` và các hàm
- Event `DOMContentLoaded`, attach submit handler theo form tồn tại.

Luồng login:
1. Lấy `username`, `password`.
2. Gọi `api.post('/auth/signin', { username, password })`.
3. Nếu success:
   - Set localStorage:
     - `isLoggedIn`, `user_id`, `username`, `fullname`, `avatar`, `role`.
   - Điều hướng:
     - admin -> `/pages/admin/index.html`
     - user -> `/index.html`
4. Nếu fail: hiển thị message lỗi tại `#login-error`.

Luồng register:
1. Kiểm tra `password === confirm_password` ở client.
2. Gọi `api.post('/auth/signup', { username, password, email })`.
3. Nếu success: hiện message thành công, delay 2s rồi về trang login.
4. Nếu fail: hiện message lỗi.

---

## 4.3 Chức năng Trang chủ user

### Danh sách file
- `fontend/index.html`
- `fontend/assets/js/main.js`

### Cấu trúc HTML `index.html`
- Dùng `<app-header></app-header>` và `<app-footer></app-footer>`.
- Vùng hiển thị sản phẩm chính:
  - `#products-container` trong `.products-grid`.

### JS `main.js`
Hàm chính:
- `formatCurrency(value)`: format tiền VND.
- `loadproduct(product)`: render 1 card sản phẩm vào `#products-container`.
- `fill()`: gọi `api.get('/products')`, duyệt dữ liệu và render từng card.

API gọi:
- `GET /api/products`

Data render:
- `id`, `tensanpham`, `giaban`, `giakhuyenmai`, `tong_soluong`, `diem_danhgia`, `hinhanh`.
- Link card điều hướng sang chi tiết: `/pages/product/productdetail.html?id=...`.

---

## 4.4 Chức năng Chi tiết sản phẩm

### Danh sách file
- `fontend/pages/product/productdetail.html`
- `fontend/pages/product/productdetail.js`

### Cấu trúc HTML `productdetail.html`
Các block chính:
- Breadcrumb.
- Loading state (`#loading-state`).
- Error state (`#error-state`).
- Product detail (`#product-detail`) gồm:
  - Ảnh sản phẩm (`#main-image`).
  - Tên, rating, giá.
  - Nhóm biến thể màu (`#options-mausac`) và size (`#options-kichthuoc`).
  - Tồn kho (`#stock-status`).
  - Số lượng (`#qty-input`).
  - Nút `#btn-add-cart`, `#btn-buy-now`.
- Mô tả sản phẩm (`#product-mota`).

### JS `productdetail.js` và logic quan trọng
Biến chính:
- `productId` lấy từ URL query `id`.
- `selectedColor`, `selectedSize`, `currentBienthe`, `currentTotalStock`.

Nhóm hàm render/utility:
- `formatTien`, `hienThiSaoDanhGia`, `formatSoluong`.
- `renderColors`, `renderSizes`, `renderStock`, `updateActionButtons`.
- `renderProduct(product)` dựng toàn bộ UI product.

API gọi:
1. Khi init:
   - `GET /api/products/:id`.
2. Khi bấm Thêm vào giỏ:
   - `POST /api/cart`
   - Payload:
     - `user_id`
     - `sanpham_id`
     - `bienthe_id` (nullable)
     - `soluong`
3. Khi bấm Mua ngay:
   - Không gọi API ngay.
   - Tạo object `buyNowItem` lưu localStorage key `buy_now_item`.
   - Redirect `/pages/checkout/checkout.html?mode=buynow`.

Cấu trúc object `buy_now_item` lưu localStorage:
- `user_id`
- `sanpham_id`
- `bienthe_id`
- `soluong`
- `tensanpham`, `giaban`, `giakhuyenmai`, `hinhanh`, `hinhanh_bienthe`, `kichthuoc`, `mausac`

---

## 4.5 Chức năng Giỏ hàng frontend

### Danh sách file
- `fontend/pages/cart/index.html`
- `fontend/pages/cart/cart.js`

### Cấu trúc HTML `cart/index.html`
Các state chính:
- Loading (`#cart-loading`)
- Chưa đăng nhập (`#cart-not-logged`)
- Giỏ trống (`#cart-empty`)
- Nội dung giỏ (`#cart-content`)
  - Danh sách item `#cart-items`
  - Summary (`#item-count`, `#subtotal`, `#total`)
  - Nút đi checkout `#checkout-btn` -> `/pages/checkout/checkout.html`

### JS `cart.js`
Hàm chính:
- `renderCartItem(item)` render 1 dòng sản phẩm trong giỏ.
- `renderCart(data)` render toàn bộ giỏ + tổng tiền.
- `loadCart()` gọi API lấy giỏ.
- `updateQuantity(cartId, newQty)` gọi API cập nhật số lượng.
- `removeItem(cartId)` gọi API xóa item.

API gọi:
1. `GET /cart?user_id=...`
2. `PUT /cart/:id` body `{ user_id, soluong }`
3. `DELETE /cart/:id?user_id=...`

Luồng qua checkout:
- Cart page không truyền item theo query/body.
- Checkout page sẽ tự gọi lại API giỏ để lấy item hiện tại khi không ở mode buy-now.

---

## 4.6 Chức năng Header user frontend

### File chính
- `fontend/components/components.js`

### Header hiển thị gì
Khi chưa đăng nhập:
- Nút Đăng nhập, Đăng ký.

Khi đã đăng nhập:
- Avatar + dropdown menu gồm:
  - Hồ sơ
  - Địa chỉ
  - Đơn hàng
  - Giỏ hàng
  - Đăng xuất

### Search trên header
- Input tìm kiếm gọi `GET /api/products/search` với debounce.
- Render dropdown kết quả gồm ảnh, tên, giá.

### Dữ liệu header lấy từ đâu
- localStorage keys:
  - `isLoggedIn`
  - `role`
  - `username`
  - `fullname`
  - `avatar`
  - `user_id` (dùng ở các trang khác)

---

## 4.7 Chức năng Checkout frontend (Mua ngay / Mua từ giỏ, COD / MoMo)

### Danh sách file
- `fontend/pages/checkout/checkout.html`
- `fontend/pages/checkout/checkout.js`
- `fontend/pages/checkout/payment-success.html`
- `fontend/pages/checkout/payment-success.js`

### Cấu trúc HTML `checkout.html`
Các vùng chính:
- State loading, chưa đăng nhập, giỏ trống, đặt hàng thành công.
- Nội dung checkout gồm:
  - Cột trái:
    - Địa chỉ nhận hàng (`#address-display`)
    - Danh sách sản phẩm checkout (`#checkout-items`)
    - Ghi chú (`#order-note`)
  - Cột phải:
    - Tóm tắt tiền
    - Chọn phương thức thanh toán radio:
      - `tienmat`
      - `momo`
    - Nút `Đặt hàng`.
- Modal chọn địa chỉ.

### JS `checkout.js` - luồng chi tiết

Biến global:
- `cartItems`, `cartTotal`, `addresses`, `selectedAddress`, `buyNowItem`.

Bước khởi tạo `init()`:
1. Kiểm tra đăng nhập qua localStorage `user_id`.
2. Load địa chỉ: gọi `GET /address?user_id=...`.
3. Xác định mode:
   - Nếu URL có `mode=buynow`:
     - Đọc localStorage `buy_now_item`.
     - Nếu đúng `user_id` hiện tại -> dùng làm `cartItems` (1 item).
   - Nếu không có buy-now item:
     - Gọi `GET /cart?user_id=...` để lấy giỏ.
4. Render danh sách item + summary.

Hàm đặt hàng `placeOrder()`:
1. Validate có `user_id` và `selectedAddress`.
2. Lấy `selectedPaymentMethod` từ radio (`tienmat` hoặc `momo`).
3. Tạo payload:
   - `user_id`
   - `diachi_id`
   - `ghichu`
   - `phuongthuc_thanhtoan`
   - Nếu buy now: thêm `items` gồm mảng 1 phần tử:
     - `sanpham_id`, `bienthe_id`, `soluong`
4. Gọi `POST /orders` với payload.
5. Nếu phương thức là MoMo:
   - Lấy `res.data.payUrl` và redirect.
6. Nếu COD:
   - Hiển thị state đặt hàng thành công ngay tại checkout page.
7. Nếu là buy-now và đặt thành công:
   - Xóa localStorage `buy_now_item`.

### Payment success page
`payment-success.js`:
- Đọc query params trả về từ MoMo:
  - `orderId`, `resultCode`, `message`.
- Render UI thành công/thất bại theo `resultCode`.
- Gọi API `POST /orders/momo/ipn` với payload:
  - `orderId`
  - `resultCode`

---

## 5) Tóm tắt luồng end-to-end theo kịch bản

## 5.1 Đăng ký
1. User submit form register.
2. Frontend gọi `POST /api/auth/signup`.
3. Backend validate Joi -> service kiểm tra trùng -> hash password -> insert users.
4. Frontend hiện thành công và chuyển sang login.

## 5.2 Đăng nhập
1. User submit login.
2. Frontend gọi `POST /api/auth/signin`.
3. Backend validate -> kiểm tra user/pass.
4. Frontend lưu localStorage (user_id, role, avatar...) và chuyển trang.

## 5.3 Trang chủ -> chi tiết sản phẩm
1. `index.html` load gọi `GET /api/products`.
2. Click card sang `productdetail.html?id=...`.
3. `productdetail.js` gọi `GET /api/products/:id`.
4. Render biến thể, tồn kho, giá.

## 5.4 Mua ngay + COD
1. Ở product detail bấm "Mua ngay".
2. Frontend lưu `buy_now_item`, chuyển `checkout.html?mode=buynow`.
3. Checkout đọc `buy_now_item`, render 1 item.
4. Chọn tiền mặt, bấm đặt hàng.
5. Frontend gọi `POST /api/orders` với `items`.
6. Backend tạo đơn theo nhánh mua ngay, trả thành công.
7. Frontend hiển thị state "Đặt hàng thành công".

## 5.5 Mua ngay + MoMo
1. Các bước 1-4 như trên, nhưng chọn phương thức `momo`.
2. Backend tạo đơn + gọi MoMo -> trả `payUrl`.
3. Frontend redirect sang MoMo.
4. Quay về trang success, frontend gọi `/api/orders/momo/ipn` để cập nhật trạng thái thanh toán.

## 5.6 Mua từ giỏ + COD
1. User thêm sản phẩm vào giỏ (`POST /api/cart`).
2. Vào cart page, chỉnh số lượng/xóa item nếu cần.
3. Sang checkout (không mode buynow), checkout gọi `GET /api/cart` để lấy toàn bộ item.
4. Chọn COD, đặt hàng.
5. Backend tạo đơn từ dữ liệu giỏ, sau đó `clearCart`.

## 5.7 Mua từ giỏ + MoMo
1. Như luồng mua từ giỏ.
2. Chọn MoMo khi đặt hàng.
3. Backend trả `payUrl`, frontend redirect thanh toán.
4. Payment success page gọi API cập nhật trạng thái thanh toán.

---

## 6) Chi tiết từng file (backend + frontend trong phạm vi yêu cầu)

## 6.1 Backend files

| File | Chứa gì | Hàm/chức năng chính |
|---|---|---|
| index.js | Khởi tạo server, mount route, static upload | app.use, app.listen |
| src/config/config.json | Cấu hình DB theo môi trường | thông số DB |
| src/config/db.js | Tạo MySQL pool | createPool, getConnection |
| src/middlewares/validate.middleware.js | Middleware validate Joi | validateRequest |
| src/validation/auth.validate.js | Joi cho signup/signin | validateSignup, validateSignin |
| src/validation/product.validate.js | Joi params id/category | validateProductId, validateCategoryId |
| src/validation/address.validate.js | Joi dữ liệu địa chỉ | validateAddressCreate/Update/SetDefault |
| src/validation/profile.validate.js | Joi dữ liệu profile | validateProfile |
| src/routes/auth.route.js | Route auth | POST signup/signin |
| src/controller/auth.controller.js | Xử lý HTTP auth | signup, signin |
| src/services/auth.service.js | Nghiệp vụ auth | signup, signin |
| src/dao/auth.dao.js | Query users auth | createUser, getUserByUsername, getUserByEmail |
| src/routes/product.route.js | Route products user | GET list/search/detail/category |
| src/controller/user.productsController.js | HTTP products | index, search, productDetail, getProductsByCategoryId |
| src/services/product.service.js | Nghiệp vụ products | getAllProducts, searchProducts, getProductById, getProductsByCategoryId |
| src/dao/user.productsDao.js | SQL products | getAllProducts, searchProducts, getProductById, getProductsByCategoryId |
| src/routes/cart.route.js | Route cart | GET/POST/PUT/DELETE cart |
| src/controller/cart.controller.js | HTTP cart | getCart, addToCart, updateCartItem, removeCartItem |
| src/services/cart.service.js | Nghiệp vụ cart | getCart, addToCart, updateCartItem, removeCartItem, clearCart |
| src/dao/cart.dao.js | SQL cart | getCartByUserId, addToCart, updateQuantity, removeCartItem, clearCart, getCartTotal |
| src/routes/order.route.js | Route order/checkout | createOrder, momoIpn, getOrders, getOrderById, cancelOrder |
| src/controller/order.controller.js | HTTP order | createOrder, getOrders, getOrderById, momoIpn, cancelOrder |
| src/services/order.service.js | Nghiệp vụ checkout/order | createOrder, taoPhienThanhToanMomo, updateTrangThaiMOMO, getOrders, getOrderById, cancelOrder |
| src/dao/order.dao.js | SQL order | taoDonHang, taoChiTietDonHang, updateTonkho, getOrderById, updateTrangThaiThanhToan, cancelOrder... |
| src/services/momo.service.js | Tích hợp MoMo API | taoThanhToan, createSignature, postJson |
| src/routes/address.route.js | Route địa chỉ | CRUD + set default |
| src/controller/address.controller.js | HTTP địa chỉ | postAddress, conditionMacDinh, getAllAddress, getIdAddress, putAddress, deleteAddress |
| src/services/address.service.js | Nghiệp vụ địa chỉ | postAddress, conditionMacDinh, getAllAddress, getIdAddress, putAddress, deleteAddress |
| src/dao/address.dao.js | SQL địa chỉ | postAddress, conditionMacDinh, getAllAddress, getAddressById, putAddress, deleteAddress |
| src/routes/profile.route.js | Route profile + upload avatar | get/put profile, post avatar |
| src/controller/profile.controller.js | HTTP profile | uploadAvatar, getProfile, putProfile |
| src/services/profile.service.js | Nghiệp vụ profile | getProfile, putProfile |
| src/dao/profile.dao.js | SQL profile | getProfile, putProfile |

## 6.2 Frontend files

| File | Chứa gì | Hàm/chức năng chính |
|---|---|---|
| fontend/index.html | Trang chủ user | vùng render products, header/footer |
| fontend/assets/js/api.js | API client dùng chung | api.get/post/put/patch/delete/upload |
| fontend/assets/js/image.js | Helper URL ảnh | imageUtil.product/avatar/logo |
| fontend/assets/js/main.js | Logic trang chủ | fill, loadproduct |
| fontend/components/components.js | Header/Footer global | AppHeader, search dropdown, AppFooter |
| fontend/pages/auth/login.html | UI đăng nhập | form login |
| fontend/pages/auth/register.html | UI đăng ký | form register |
| fontend/pages/auth/auth.js | Logic auth frontend | submit login/register |
| fontend/pages/product/productdetail.html | UI chi tiết sản phẩm | vùng biến thể, số lượng, action buttons |
| fontend/pages/product/productdetail.js | Logic chi tiết sản phẩm | renderProduct, add cart, buy now |
| fontend/pages/cart/index.html | UI giỏ hàng | loading/not-login/empty/content |
| fontend/pages/cart/cart.js | Logic giỏ hàng | loadCart, renderCart, updateQuantity, removeItem |
| fontend/pages/checkout/checkout.html | UI checkout | địa chỉ, sản phẩm, payment method, summary |
| fontend/pages/checkout/checkout.js | Logic checkout | init, loadAddresses, placeOrder, modal address |
| fontend/pages/checkout/payment-success.html | UI kết quả thanh toán | hiển thị success/failed |
| fontend/pages/checkout/payment-success.js | Logic kết quả MoMo | parse query, gọi ipn API |

---

## 7) Dữ liệu chính trong DB liên quan chức năng

Các bảng cốt lõi đang được dùng trực tiếp bởi các DAO trong phạm vi chức năng user:
- `users` (đăng nhập/đăng ký/profile)
- `sanpham`, `bienthesp`, `danhgia`, `hinhanh_sanpham` (trang chủ, detail)
- `giohang` (cart)
- `diachigiaohang` (địa chỉ giao hàng)
- `donhang`, `chitietdonhang`, `lichsu_donhang` (checkout/order)

Các trạng thái quan trọng:
- `donhang.trangthai`: `choxacnhan`, `daxacnhan`, `dangxuly`, `danggiao`, `dagiao`, `dahuy`
- `donhang.trangthai_thanhtoan`: `chuathanhtoan`, `dathanhtoan`, `hoantien`
- `donhang.phuongthuc_thanhtoan`: `tienmat`, `chuyenkhoan`, `vnpay`, `momo`

---

## 8) Ghi chú kỹ thuật quan trọng khi bảo trì

1. Header/search và nhiều trang dựa vào localStorage, chưa có session/token auth chuẩn cho API.
2. Nhiều API backend phụ thuộc `user_id` truyền từ client, cần cẩn trọng khi mở rộng quyền truy cập.
3. Trong `order.service.js`, `phivanchuyen` đang set 0, trong khi frontend cart/checkout đang hiển thị 30.000 VND; có thể gây lệch kỳ vọng hiển thị.
4. `momo.service.js` đang chứa key test hard-code trong mã nguồn, nên chuyển sang biến môi trường khi triển khai thật.
5. `payment-success.js` đang gọi `/orders/momo/ipn` từ frontend; về mô hình chuẩn, IPN thường là server-to-server callback từ MoMo.
6. Cart service hiện chặn trùng theo cặp `user_id + sanpham_id` (không xét biến thể), có thể ảnh hưởng trường hợp user muốn thêm cùng sản phẩm khác size/màu.

---

## 9) Kết luận
Codebase hiện đã tách layer tương đối rõ (route -> controller -> service -> dao), đáp ứng đủ flow user cơ bản:
- Auth
- Duyệt và xem chi tiết sản phẩm
- Quản lý giỏ hàng
- Checkout theo cả 2 cách (mua ngay/mua từ giỏ)
- Thanh toán COD/MoMo

Tài liệu này có thể dùng làm nền cho:
- Onboarding thành viên mới.
- Viết test API theo luồng nghiệp vụ.
- Rà soát refactor security (auth/authorization) và chuẩn hóa flow thanh toán.
