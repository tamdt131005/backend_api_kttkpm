# Chức năng: Trang chủ user

## 1) Mục tiêu chức năng
- Hiển thị danh sách sản phẩm mới/đang bán trên trang chủ.
- Mỗi sản phẩm hiển thị tên, giá, giảm giá, tình trạng tồn kho, ảnh.
- Khi click sản phẩm, điều hướng sang trang chi tiết sản phẩm.

## 2) File liên quan

## Backend
- `src/routes/product.route.js`
- `src/controller/user.productsController.js`
- `src/services/product.service.js`
- `src/dao/user.productsDao.js`

## Frontend
- `fontend/index.html`
- `fontend/assets/js/main.js`
- `fontend/assets/js/api.js`
- `fontend/assets/js/image.js`
- `fontend/components/components.js`

---

## 3) Luồng chạy tổng thể (từ trình duyệt đến DB)

Khi user mở trang chủ, luồng thực tế diễn ra như sau:

1. Trình duyệt tải `index.html`.
2. Sự kiện `DOMContentLoaded` trong `main.js` gọi hàm `fill()`.
3. `fill()` gọi `api.get('/products')`.
4. `api.get` gọi `apiCall` trong `api.js` và thực hiện HTTP request:
    - `GET http://localhost:3000/api/products`.
5. Backend nhận request theo chain:
    - route -> controller -> service -> dao -> MySQL.
6. Backend trả JSON `{ success, message, data }`.
7. `fill()` lấy `res.data` (mảng sản phẩm), lặp từng phần tử và gọi `loadproduct(product)`.
8. `loadproduct()` tạo HTML card rồi đẩy vào `#products-container` bằng `insertAdjacentHTML`.

---

## 4) Backend rất chi tiết: hàm nào gọi hàm nào

## 4.1 Route: nhận URL và trỏ vào controller

Trong `product.route.js`, trang chủ dùng dòng:

```js
router.get('/', userProductsController.index);
```

Ý nghĩa:
- Khi có `GET /api/products`, Express gọi hàm `index` trong controller.

## 4.2 Controller: nhận request, gọi service, trả response

Hàm dùng cho trang chủ trong `user.productsController.js`:

```js
async index(req, res) {
   try {
      const products = await productService.getAllProducts();
      res.status(200).json({
         success: true,
         message: 'Lấy danh sách sản phẩm thành công',
         data: products
      });
   } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi Server' });
   }
}
```

Ý nghĩa:
- Controller không viết SQL.
- Controller chỉ làm 2 việc chính:
   - gọi service để lấy dữ liệu,
   - chuẩn hóa JSON trả ra cho frontend.

## 4.3 Service: lớp trung gian nghiệp vụ

Hàm dùng cho trang chủ trong `product.service.js`:

```js
async getAllProducts() {
   const products = await userProductsDAO.getAllProducts();
   return products;
}
```

Ý nghĩa:
- Hiện tại logic đơn giản: chuyển tiếp xuống DAO và trả lại.
- Nếu sau này cần nghiệp vụ (lọc theo quyền, cache, tính toán thêm), chèn ở đây.

## 4.4 DAO: nơi truy vấn DB thật

Hàm dùng cho trang chủ trong `user.productsDao.js`:

```js
async getAllProducts() {
   const [rows] = await pool.query(`
      SELECT sp.id, sp.tensanpham, sp.giaban, sp.giakhuyenmai, sp.hinhanh,
                COALESCE(SUM(bt.soluong), 0) AS tong_soluong,
                COALESCE(AVG(dg.sao), 0) AS diem_danhgia,
                COUNT(dg.id) AS luot_danhgia
      FROM sanpham sp
      LEFT JOIN bienthesp bt ON sp.id = bt.sanpham_id
      LEFT JOIN danhgia dg ON sp.id = dg.sanpham_id
      WHERE sp.an_hien = 1 AND sp.deleted_at IS NULL
      GROUP BY sp.id
      ORDER BY sp.createdAt DESC
      LIMIT 8
   `);

   return rows;
}
```

Ý nghĩa truy vấn:
- Lấy sản phẩm còn hiển thị và chưa xóa mềm.
- Gộp dữ liệu tồn kho + đánh giá để frontend hiển thị ngay.
- Chỉ lấy 8 sản phẩm mới nhất cho trang chủ.

---

## 5) Backend trả dữ liệu gì cho frontend

API dùng cho trang chủ:

| API | Method | Input | Output |
|---|---|---|---|
| `/api/products` | GET | không có body/query bắt buộc | `{ success, message, data }` |

Mẫu dữ liệu 1 phần tử trong `data` (rút gọn):

```json
{
   "id": 1,
   "tensanpham": "Áo thun basic đen",
   "giaban": 200000,
   "giakhuyenmai": 150000,
   "hinhanh": "anh1.jpg",
   "tong_soluong": 50,
   "diem_danhgia": 4.3,
   "luot_danhgia": 12
}
```

Field frontend trang chủ đang dùng trực tiếp:
- `id`
- `tensanpham`
- `giaban`
- `giakhuyenmai`
- `hinhanh`
- `tong_soluong`
- `diem_danhgia`

---

## 6) Frontend rất chi tiết: HTML viết gì, JS render thế nào

## 6.1 Cấu trúc `index.html`

Phần quan trọng của HTML:

```html
<app-header></app-header>

<div class="container">
   <section class="products-section">
      <div id="products-container" class="products-grid"></div>
   </section>
</div>

<app-footer></app-footer>
```

Ý nghĩa:
- `app-header` và `app-footer`: component dùng chung toàn site.
- `#products-container`: vùng JS sẽ bơm card sản phẩm vào.

Thứ tự script cuối trang:

```html
<script src="./assets/js/image.js"></script>
<script src="./assets/js/api.js"></script>
<script src="./assets/js/main.js"></script>
<script src="./components/components.js"></script>
```

Ý nghĩa thứ tự:
- `main.js` cần `imageUtil` và `api`, nên `image.js` + `api.js` phải load trước.

## 6.2 Vai trò `api.js` trong trang chủ

`main.js` không gọi `fetch` trực tiếp mà gọi:

```js
api.get('/products')
```

`api.get` sẽ đi vào `apiCall`, ghép URL:

```text
BASE_URL + endpoint = http://localhost:3000/api/products
```

Sau đó parse JSON và trả object về cho `fill()`.

## 6.3 Vai trò `image.js` trong render ảnh

Khi render card, `main.js` gọi:

```js
const duongDanAnh = imageUtil.product(product.hinhanh);
```

Ý nghĩa:
- Chuẩn hóa tên file ảnh thành URL hoàn chỉnh.
- Nếu thiếu ảnh, có ảnh fallback mặc định.

---

## 7) Giải thích cực chi tiết `main.js`

`main.js` có 3 hàm trọng tâm cho trang chủ:
- `formatCurrency(value)`
- `loadproduct(product)`
- `fill()`

## 7.1 `formatCurrency(value)`

Code:

```js
function formatCurrency(value) {
   if (typeof value !== 'number') return value;
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
   }).format(value);
}
```

Tác dụng:
- Chuyển số tiền thô thành dạng đẹp theo chuẩn Việt Nam.
- Ví dụ: `150000` -> `150.000 ₫`.

## 7.2 `loadproduct(product)`

Đây là hàm render 1 sản phẩm.

Bước xử lý bên trong:
1. Tách field từ `product`: `id`, `tensanpham`, `giaban`, `giakhuyenmai`, `tong_soluong`, `diem_danhgia`...
2. Ép kiểu về number để tránh lỗi kiểu dữ liệu.
3. Tính có giảm giá hay không:
    - `coGiamGia = giakhuyenmai > 0 && giakhuyenmai < giaban`.
4. Nếu có giảm giá thì tính `% giảm`.
5. Tạo `priceHtml`:
    - Có giảm: hiện giá sale + giá gốc.
    - Không giảm: hiện giá thường.
6. Tạo `stockHtml` theo tồn kho:
    - `>10`: Còn hàng.
    - `1..10`: Sắp hết.
    - `0`: Hết hàng.
7. Dựng chuỗi template `producthtml` cho card sản phẩm.
8. Chèn card vào DOM:

```js
container.insertAdjacentHTML('beforeend', producthtml);
```

Tác dụng:
- Mỗi lần gọi `loadproduct`, UI thêm 1 card mới vào cuối danh sách.

Lưu ý kỹ thuật:
- Có biến `diemLamTron` được tính nhưng hiện chưa dùng để render trong card.

## 7.3 `fill()` (hàm bạn hỏi kỹ)

Code hiện tại:

```js
async function fill() {
   const res = await api.get('/products');
   if (res.success) {
      const products = res.data;
      products.forEach(product => {
         loadproduct(product);
      });
   }
}
```

Giải thích thật chi tiết:

1. `fill()` chạy bất đồng bộ (`async`) để chờ API.
2. `await api.get('/products')` gửi request lên backend và đợi response.
3. `res` nhận về object dạng:

```json
{
   "success": true,
   "message": "Lấy danh sách sản phẩm thành công",
   "data": [ ...mang-san-pham... ]
}
```

4. Nếu `res.success === true`, hàm lấy `res.data` gán vào `products`.
5. `products.forEach(...)` lặp từng phần tử.
6. Mỗi phần tử được đưa vào `loadproduct(product)` để render 1 card.
7. Sau vòng lặp, toàn bộ sản phẩm đã hiển thị trên trang chủ.

Hàm `fill()` được kích hoạt bởi:

```js
document.addEventListener('DOMContentLoaded', fill);
```

Ý nghĩa:
- Chỉ render khi HTML đã sẵn sàng, tránh lỗi không tìm thấy `#products-container`.

---

## 8) Sơ đồ gọi hàm rút gọn

```text
DOMContentLoaded
   -> fill()
      -> api.get('/products')
         -> apiCall('/products', 'GET')
            -> fetch('http://localhost:3000/api/products')

Backend:
GET /api/products
   -> router.get('/', userProductsController.index)
      -> index(req, res)
         -> productService.getAllProducts()
            -> userProductsDAO.getAllProducts()
               -> SQL query MySQL
         -> res.json({ success, message, data })

Frontend nhận data:
   -> products.forEach(loadproduct)
      -> insertAdjacentHTML vào #products-container
```

---

## 9) Vai trò từng file (nhìn nhanh)
- `product.route.js`: map URL `/api/products` tới controller.
- `user.productsController.js`: chuẩn hóa response API cho trang chủ.
- `product.service.js`: lớp nghiệp vụ trung gian.
- `user.productsDao.js`: truy vấn SQL tổng hợp dữ liệu sản phẩm.
- `index.html`: tạo khung trang và vùng chứa danh sách sản phẩm.
- `main.js`: gọi API + render card ra DOM.
- `api.js`: helper HTTP chung.
- `image.js`: chuẩn hóa URL ảnh.

---

## 10) Lưu ý bảo trì
- `LIMIT 8` hiện hard-code trong DAO.
- Nếu thêm phân trang/infinite scroll, cần sửa cả backend API và `fill()` ở frontend.
- Nên bổ sung xử lý lỗi trong `fill()` (try/catch + UI fallback) để tránh trang trống khi API lỗi.
