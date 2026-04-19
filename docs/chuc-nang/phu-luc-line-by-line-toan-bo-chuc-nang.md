# Phu luc: Phan tich line-by-line toan bo chuc nang user

Tai lieu nay mo rong muc do chi tiet so voi bo docs chuc nang chinh.
Muc tieu:
- bam sat code thuc te theo tung ham,
- mo ta ro route -> validation -> controller -> service -> dao,
- theo doi frontend event -> API -> render,
- chi ra cac nhanh loi va diem can luu y khi van hanh.

Du lieu phan tich duoc doi chieu truc tiep tu code hien tai trong repo.

---

## 0) Nen tang chung (ap dung cho moi module)

## 0.1 Entry backend

File `index.js` mount route theo thu tu:
1. `/api/auth`
2. `/api/products`
3. `/api/cart`
4. `/api/address`
5. `/api/orders`
6. `/api/profile`
7. `/api/admin`

Co static image mapping:
- `/upload/img` -> `src/upload/img`

## 0.2 API helper frontend (`fontend/assets/js/api.js`)

`apiCall(endpoint, method, body)` co hanh vi quan trong:
1. Tu dong gan `Content-Type: application/json`.
2. Co doc `token` tu localStorage va gan header `Authorization` neu ton tai.
3. Neu HTTP status khong OK:
- `>=500`: throw Error.
- `<500`: khong throw, tra thang object JSON loi de UI xu ly.

He qua:
- Frontend thuong check `if (!res.success)` thay vi phu thuoc `catch` cho loi nghiep vu 4xx.

## 0.3 Validation middleware (`src/middlewares/validate.middleware.js`)

`validateRequest(schema, property='body')`:
1. Chay Joi validate.
2. Neu loi: tra `400` voi:
```json
{
  "success": false,
  "message": "Du lieu dau vao khong hop le",
  "errors": ["..."]
}
```
3. Hop le thi `next()`.

---

## A) Dang ky va Dang nhap

## A.1 Endpoint map

| Endpoint | Method | Validation | Controller |
|---|---|---|---|
| `/api/auth/signup` | POST | `validateSignup` | `signup` |
| `/api/auth/signin` | POST | `validateSignin` | `signin` |

## A.2 Trace backend theo ham

### `auth.controller.signup(req, res)`
1. Lay `username, password, fullname, email` tu `req.body`.
2. Goi `authService.signup(...)`.
3. Thanh cong tra `201` + message dang ky.
4. Loi thi doc `error.status || 500` va tra `{ success:false, message }`.

### `auth.service.signup(username, password, fullname, email)`
1. `authDao.getUserByUsername(username)`.
2. Neu ton tai -> throw `409`.
3. `authDao.getUserByEmail(email)`.
4. Neu ton tai -> throw `409`.
5. Tao salt bcrypt cost `10`.
6. Hash password.
7. `authDao.createUser(username, hashedPassword, fullname || username, email)`.

### `auth.controller.signin(req, res)`
1. Lay `username, password`.
2. Goi `authService.signin(...)`.
3. Thanh cong tra `200` + `user`.
4. Loi map status tu service (`404`, `400`) hoac `500`.

### `auth.service.signin(username, password)`
1. `authDao.getUserByUsername(username)`.
2. Neu khong co -> throw `404`.
3. `bcrypt.compare(password, user.password)`.
4. Neu sai -> throw `400`.
5. Tra object rut gon:
- `id: user.id || user.user_id`
- `username`
- `fullname`
- `role`
- `avatar`

## A.3 Trace frontend (`fontend/pages/auth/auth.js`)

### Dang nhap
1. Bat submit form, `preventDefault()`.
2. Goi `api.post('/auth/signin', { username, password })`.
3. Neu `data.success`:
- set localStorage `isLoggedIn, user_id, username, fullname, avatar, role`.
- dieu huong theo role (`admin`/`user`).
4. Neu fail: hien message vao `#login-error-text`.

### Dang ky
1. Bat submit form register.
2. Check `password === confirm_password` phia client.
3. Goi `api.post('/auth/signup', { username, password, email })`.
4. Thanh cong: hien success, delay 2s, ve login.

## A.4 Ghi chu theo code hien tai

1. Dang ky frontend khong gui `fullname`, service se fallback bang `username`.
2. Khong co JWT flow thuc su cho user, trang thai dang nhap dang dua localStorage.
3. `api.js` van doc `token` neu co, nhung luong auth user hien tai khong set token.

---

## B) Trang chu user + tim kiem

## B.1 Endpoint map

| Endpoint | Method | Validation | Controller |
|---|---|---|---|
| `/api/products` | GET | khong | `index` |
| `/api/products/search?q=&limit=` | GET | khong | `search` |
| `/api/products/:id` | GET | `validateProductId` | `productDetail` |
| `/api/products/category/:category_id` | GET | `validateCategoryId` | `getProductsByCategoryId` |

## B.2 Trace backend tim kiem

### `product.service.searchProducts(query, limit)`
1. Trim query.
2. Neu rong -> tra `[]`.
3. Chuan hoa limit:
- hop le va >0: `Math.min(limit, 20)`
- nguoc lai: mac dinh `6`
4. Goi `userProductsDAO.searchProducts(keyword, finalLimit)`.

### `user.productsDao.searchProducts(keyword, limit)`
1. Tao `q = %keyword%`, `qStart = keyword%`.
2. Search theo 3 cot:
- `tensanpham`
- `slug`
- `thuonghieu`
3. `ORDER BY CASE WHEN tensanpham LIKE qStart THEN 0 ELSE 1 END`.
4. Sau do uu tien `updatedAt DESC, id DESC`.

## B.3 Trace frontend trang chu (`fontend/assets/js/main.js`)

1. `DOMContentLoaded -> fill()`.
2. `fill()` goi `api.get('/products')`.
3. Neu success, loop `res.data` va goi `loadproduct(product)`.
4. `loadproduct`:
- chuan hoa gia,
- tinh phan tram giam,
- xac dinh stock badge,
- render card vao `#products-container`.

## B.4 Ghi chu theo code hien tai

1. `fill()` chua co `try/catch`; neu API throw (5xx/network) UI co the khong render va khong co fallback.
2. Frontend danh gia sao o trang chu co tinh `diemLamTron` nhung khong dung de render.
3. Query trang chu hard-code `LIMIT 8` trong DAO.

---

## C) Chi tiet san pham

## C.1 Trace frontend (`fontend/pages/product/productdetail.js`)

### Khoi tao
1. Doc `id` tu query string.
2. Neu thieu -> an loading, hien error-state.
3. Goi `api.get('/products/:id')`.
4. `renderProduct(res.data)`.

### `renderProduct(product)`
1. Tinh gia hien thi + gia goc + badge discount.
2. Fill breadcrumb, ten, rating, gia.
3. Set anh chinh qua `imageUtil.product(...)`.
4. Nap state bien the:
- `currentBienthe`
- `selectedColor`
- `selectedSize`
5. Render button mau + size.
6. Tinh ton kho dang chon qua `getVariant(...)` va `renderStock(...)`.
7. Clone va bind lai toan bo nut +/-/add-cart/buy-now de tranh duplicate listener.

### Add to cart
1. Check login (`user_id` localStorage).
2. Build payload:
```json
{
  "user_id": 3,
  "sanpham_id": 10,
  "bienthe_id": 99,
  "soluong": 2
}
```
3. Goi `POST /api/cart`.

### Buy now
1. Build snapshot `buy_now_item`.
2. Luu localStorage.
3. Redirect `/pages/checkout/checkout.html?mode=buynow`.

## C.2 Trace backend

1. Route: `GET /api/products/:id` qua `validateProductId`.
2. Controller `productDetail` goi service.
3. Service `getProductById` throw `404` neu null.
4. DAO `getProductById` thuc hien 3 query:
- query tong hop product + danhmuc + danhgia + tong ton,
- query bien the,
- query anh phu.

## C.3 Ghi chu theo code hien tai

1. `currentTotalStock` dang gan tu `product.soluong`, trong khi payload backend tra truong tong ton la `tong_soluong`; neu khong chon bien the co the hien sai stock.
2. Nhieu ham render phu thuoc chat ten field `mausac`, `kichthuoc`, `soluong`; doi schema se anh huong truc tiep UI.

---

## D) Gio hang

## D.1 Endpoint map

| Endpoint | Method | Input chinh |
|---|---|---|
| `/api/cart` | GET | query `user_id` |
| `/api/cart` | POST | body `user_id, sanpham_id, bienthe_id?, soluong` |
| `/api/cart/:id` | PUT | body `user_id, soluong` |
| `/api/cart/:id` | DELETE | query `user_id` |

## D.2 Trace backend

### `cart.service.addToCart(userId, sanphamId, bientheId, soluong)`
1. Goi `cartDAO.findCartItem(userId, sanphamId)`.
2. Neu ton tai -> throw `400` (khong cho trung).
3. Neu khong -> `cartDAO.addToCart(...)`.

### `cart.dao.getCartByUserId(userId)`
1. Join `giohang`, `sanpham`, `bienthesp`.
2. Tra field can cho UI:
- `giohang_id`, `sanpham_id`, `bienthe_id`, `soluong`
- `tensanpham`, `giaban`, `giakhuyenmai`, `hinhanh`
- `kichthuoc`, `mausac`, `soluong_kho`, `hinhanh_bienthe`

### `cart.dao.getCartTotal(userId)`
Cong tong theo CASE:
- dung `giakhuyenmai` neu hop le,
- khong thi dung `giaban`.

## D.3 Trace frontend (`fontend/pages/cart/cart.js`)

1. `DOMContentLoaded -> loadCart()`.
2. Neu chua login -> hien state `cart-not-logged`.
3. Goi `GET /cart?user_id=...`.
4. `renderCart(data)`:
- render list item,
- cap nhat subtotal/total.
5. `updateQuantity` va `removeItem` deu goi API xong roi `await loadCart()`.

## D.4 Ghi chu theo code hien tai

1. Rule trung item hien tai check theo `user_id + sanpham_id`, chua tach theo `bienthe_id`.
2. Phi ship tren cart UI = `30000`, khac backend order (dang de `0`).
3. Nut tang/giam goi API lien tuc, chua co debounce hoac lock theo item.

---

## E) Header user + Search realtime

## E.1 Trace `AppHeader.connectedCallback()`

1. Doc localStorage: `isLoggedIn, role, username, fullname, avatar`.
2. Neu da login va role admin nhung khong o trang admin -> redirect admin index.
3. Build user block:
- da login: avatar + dropdown,
- guest: login/register links.
4. Bind event dropdown:
- click trigger toggle menu,
- click ngoai dong menu,
- ESC dong menu.
5. Bind event search:
- input/focus/keydown,
- click ngoai de an ket qua.

## E.2 Pipeline tim kiem

1. `timkiem(query)` clear timeout cu.
2. query < 2 ky tu -> an ket qua.
3. Neu du do dai -> hien loading va set timeout 300ms.
4. Goi `GET /products/search?q=...&limit=6`.
5. Kiem tra race-condition: `if (query !== currentSearchQuery) return;`
6. Co ket qua -> `fillkq(products)`.
7. Khong co/loi -> `khongcokq()`.

## E.3 Ghi chu theo code hien tai

1. Logout dang dung inline `localStorage.clear(); location.reload();` -> se xoa tat ca key (khong chi auth).
2. Search item link dung field backend `sanpham_id`; thay doi field nay se vo ngay feature.

---

## F) Profile user

## F.1 Endpoint map

| Endpoint | Method | Validation |
|---|---|---|
| `/api/profile/avatar` | POST | multer file check |
| `/api/profile/:id` | GET | khong Joi params |
| `/api/profile` | PUT | `validateProfile` |

## F.2 Trace backend

### Upload avatar (`profile.route.js` + controller)
1. Multer tao folder `src/upload/img/avatar` neu chua co.
2. Gioi han file 2MB.
3. Chi nhan `mimetype` bat dau bang `image/`.
4. Dat ten file `avatar_<timestamp>.<ext>`.
5. Controller tra `201` + `data.avatar = avatar/<filename>`.

### Get profile
1. Controller doc `id` params.
2. Service goi DAO `getProfile(id)`.
3. DAO query bang `users`.
4. Neu khong thay, service throw `404`.

### Update profile
1. Controller tach `{ id, ...profileData }`.
2. Service goi DAO update.
3. DAO tra `affectedRows`.
4. Neu `<=0`, service throw `404`.

## F.3 Trace frontend (`fontend/pages/profile/profile.js`)

1. `DOMContentLoaded -> hienThiManHinh()`.
2. `bindAvatarInput()` gan preview local ngay khi chon file.
3. `getUser()` goi `GET /profile/:id` de load form.
4. Submit `updateProfile`:
- disable button,
- build payload,
- neu co file thi upload truoc,
- goi `PUT /profile`,
- sync localStorage `fullname/avatar`,
- render lai va show alert.

## F.4 Ghi chu theo code hien tai

1. `toDateInput` uu tien date-only `YYYY-MM-DD`, giup tranh lech ngay do timezone.
2. Controller profile trong catch dang tra `500` co dinh, khong map `error.status` tu service.
3. Route upload avatar chua co middleware auth, phu thuoc flow client.

---

## G) Dia chi user

## G.1 Endpoint map

| Endpoint | Method | Validation |
|---|---|---|
| `/api/address` | GET | khong Joi |
| `/api/address` | POST | `validateAddressCreate` |
| `/api/address` | PATCH | `validateAddressSetDefault` |
| `/api/address/:id` | GET | khong Joi |
| `/api/address/:id` | PUT | `validateAddressUpdate` |
| `/api/address/:id` | DELETE | khong Joi |

## G.2 Trace backend

### Tao dia chi
1. Controller tach `user_id` va `addressData`.
2. Service `postAddress` insert qua DAO.
3. Neu `macdinh == 1` -> goi tiep `conditionMacDinh(insertId, user_id)`.

### Dat mac dinh
1. DAO reset tat ca dia chi user `macdinh=0`.
2. DAO set 1 dia chi muc tieu `macdinh=1`.

### Xoa dia chi
1. DAO SQL:
```sql
DELETE FROM diachigiaohang WHERE id = ? and macdinh = 0
```
2. Nghia la dia chi mac dinh khong xoa truc tiep duoc.

## G.3 Trace frontend (`fontend/pages/profile/address.js`)

1. `init()` -> load sidebar -> bind event -> loadAddresses.
2. Event delegation tren `#address-list` xu ly sua/xoa/set default.
3. Moi thao tac thanh cong deu reload list.

## G.4 Ghi chu theo code hien tai

1. `removeAddress` frontend goi `DELETE /address/:id` khong truyen user_id; backend cung dang khong check user trong ham delete.
2. `getIdAddress` service chi query theo `id`, khong rang buoc user.
3. Luong dat mac dinh la 2 query rieng, chua co transaction.

---

## H) Trang thai don hang user

## H.1 Endpoint map

| Endpoint | Method | Input |
|---|---|---|
| `/api/orders` | GET | query `user_id` |
| `/api/orders/:id` | GET | query `user_id` |
| `/api/orders/:id/cancel` | PATCH | body `user_id, lydo_huy` |

## H.2 Trace backend

### `orderService.getOrders(userId)`
- tra `orderDAO.getDonHangCuaUser(userId)`.

### `orderService.getOrderById(orderId, userId)`
1. DAO query don theo `id + user_id`.
2. Query tiep chi tiet tu `chitietdonhang` join `sanpham`.
3. Gan `order.chitiet` va tra.

### `orderService.cancelOrder(orderId, userId, lydoHuy)`
1. Kiem tra don thuoc user (`getOrderRowForUser`).
2. Chi cho huy neu `trangthai === choxacnhan`.
3. Lay item don (`getOrderItems`).
4. Hoan ton cho tung bien the (`restoreTonkho`).
5. Update don thanh `dahuy`, luu `lydo_huy`.
6. Ghi lich su `addLichSuDonHang(..., 'dahuy', ...)`.

## H.3 Trace frontend

### `orders.js`
1. Goi list don.
2. Moi don lai goi detail (`Promise.all`) -> mo hinh N+1 request.
3. Render theo tab status.
4. Modal huy don submit `PATCH /orders/:id/cancel`.

### `order-detail.js`
1. Doc `donhang_id` tren query.
2. Goi detail API.
3. Render tong hop: header, products, address snapshot, payment, note, cancelled info.
4. Nut huy chi hien khi `choxacnhan`.

## H.4 Ghi chu theo code hien tai

1. Rule tab `dangxuly` frontend gom ca `dangxuly` va `daxacnhan`.
2. List page co N+1 API call, co the ton tai do tre khi user co nhieu don.
3. DAO `addLichSuDonHang` dang set `trangthai_cu = NULL` co dinh.

---

## I) Checkout + MoMo

## I.1 Trace frontend checkout (`fontend/pages/checkout/checkout.js`)

### `init()`
1. Check login.
2. Load dia chi giao hang.
3. Kiem tra `mode=buynow`:
- Neu co va localStorage hop le -> dung `buy_now_item`.
- Neu khong -> doc tu cart API.
4. Render item va summary.

### `placeOrder()`
1. Validate da chon dia chi.
2. Disable nut va hien loading.
3. Build payload chung:
- `user_id, diachi_id, ghichu, phuongthuc_thanhtoan`
4. Neu buy-now: them `items` vao payload.
5. Goi `POST /orders`.
6. Thanh cong:
- xoa `buy_now_item` neu co,
- neu momo/chuyenkhoan va co `payUrl` -> redirect,
- neu tien mat -> hien state success inline.

## I.2 Trace backend checkout (`order.service.createOrder`)

1. Chuan hoa payment method:
- `momo` hoac `chuyenkhoan` -> `momo` (xu ly runtime), luu DB la `chuyenkhoan`.
- `tienmat` giu nguyen.
2. Xac dinh nguon item:
- co `checkoutItems` -> don mua ngay,
- khong -> lay tu cart.
3. Validate tung item + check ton kho bien the.
4. Tinh don gia (uu tien `giakhuyenmai` hop le).
5. Lay dia chi theo `addressId + userId`.
6. Tao `snapshot_diachi` JSON.
7. Tao don + chi tiet don.
8. Tru ton kho bien the.
9. Neu don cart -> clear cart.
10. Neu momo -> goi `taoPhienThanhToanMomo` va tra `payUrl`.

## I.3 Trace payment-success (`fontend/pages/checkout/payment-success.js`)

1. Doc URL param `orderId/order_code`, `resultCode`, `message`.
2. Luon goi `POST /orders/momo/ipn` voi payload `{ orderId, resultCode }`.
3. Render card thanh cong/that bai theo `resultCode`.

## I.4 Ghi chu theo code hien tai

1. Frontend summary dang cong `phiVanChuyen = 30000`, backend order dang tinh `phivanchuyen = 0`.
2. `order.controller.momoIpn` co flow catch chua return, sau do van co doan tra `200` phia duoi.
3. Response `momoIpn` co typo truong `rusltcode`.
4. MoMo config dang hard-code key va URL callback trong code service.
5. `ipnUrl` dang tro den domain cloudflare, khong phai localhost.

---

## J) Ma tran nhanh loi (backend)

| Module | Dieu kien loi | Status/hanh vi hien tai |
|---|---|---|
| Auth signup | Trung username/email | 409 |
| Auth signin | Khong ton tai / sai mat khau | 404 / 400 |
| Product detail | ID khong ton tai | 404 |
| Cart get | Thieu user_id | 400 |
| Cart update | `soluong <= 0` | 400 |
| Cart update/delete | Khong tim thay dong | 404 |
| Address getAll | Thieu user_id | 400 |
| Address delete | Dia chi mac dinh | 404 theo service message xoa that bai |
| Order create | Thieu user_id/diachi_id | 400 |
| Order create | Gio hang trong | 400 |
| Order cancel | Sai trang thai | 400 |
| Profile get/put | Service throw 404 | Controller hien tai thuong tra 500 |

---

## K) Checklist review khi refactor

1. Co doi ten endpoint hoac HTTP method nao khong.
2. Validation co dong bo voi payload frontend dang gui khong.
3. Controller co map dung status tu service khong.
4. Service co dong bo quy tac gia khuyen mai, ton kho, trang thai don khong.
5. DAO co doi alias field ma frontend dang dung (`donhang_id`, `phuongthucthanhtoan`, `hinhanh_ht`...) khong.
6. Frontend co phu thuoc localStorage key nao bi doi ten khong.
7. Co phat sinh chenhlech tong tien giua UI va backend khong (phi ship, discount).
8. Cac luong callback thanh toan (MoMo) co du fallback va status update an toan khong.

---

## L) Huong doc de debug nhanh

1. Loi dang nhap/dang ky: doc muc A.
2. Loi list san pham/search/header: doc muc B + E.
3. Loi product detail -> cart -> checkout: doc muc C + D + I.
4. Loi profile/address/orders: doc muc F + G + H.
5. Loi trang thai thanh toan MoMo: doc muc I + J.
