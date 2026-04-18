# Chức năng: Chi tiết sản phẩm

## 1) Mục tiêu chức năng
- Hiển thị thông tin chi tiết của 1 sản phẩm.
- Cho user chọn biến thể (màu/size), chọn số lượng theo tồn kho.
- Hỗ trợ 2 hành động:
   - Thêm vào giỏ hàng.
   - Mua ngay (đi thẳng checkout mode buynow).

## 2) File liên quan

## Backend
- `src/routes/product.route.js`
- `src/validation/product.validate.js`
- `src/controller/user.productsController.js`
- `src/services/product.service.js`
- `src/dao/user.productsDao.js`

## Frontend
- `fontend/pages/product/productdetail.html`
- `fontend/pages/product/productdetail.js`
- `fontend/assets/js/api.js`
- `fontend/assets/js/image.js`

---

## 3) Luồng chạy tổng thể

1. User mở URL dạng `/pages/product/productdetail.html?id=123`.
2. `productdetail.js` đọc query `id`, gọi API `GET /api/products/:id`.
3. Backend xử lý theo chain:
    - route -> validation -> controller -> service -> dao -> MySQL.
4. Frontend nhận dữ liệu sản phẩm, gọi `renderProduct(product)` để render UI.
5. User tương tác chọn màu, chọn size, chọn số lượng.
6. User bấm:
    - `Thêm vào giỏ` -> gọi `POST /api/cart`.
    - `Mua ngay` -> lưu `buy_now_item` vào localStorage, chuyển checkout.

---

## 4) Backend chi tiết: hàm nào gọi hàm nào

## 4.1 Route và validation

Trong `product.route.js`:

```js
router.get('/:id', validateProductId, userProductsController.productDetail);
```

`validateProductId` đảm bảo:
- `req.params.id` là số nguyên dương.

Nếu sai định dạng, middleware validation trả `400` ngay.

## 4.2 Controller

Trong `user.productsController.js`:

```js
async productDetail(req, res) {
   const id = req.params.id;
   const product = await productService.getProductById(id);
   res.status(200).json({
      success: true,
      message: 'Lấy thông tin sản phẩm thành công',
      data: product
   });
}
```

Ý nghĩa:
- Controller chỉ lấy `id`, gọi service, trả JSON.
- Không viết SQL tại đây.

## 4.3 Service

Trong `product.service.js`:

```js
async getProductById(id) {
   const product = await userProductsDAO.getProductById(id);
   if (!product) {
      throw { status: 404, message: 'Không tìm thấy sản phẩm' };
   }
   return product;
}
```

Ý nghĩa:
- Gọi DAO lấy dữ liệu thật.
- Chặn case không có sản phẩm bằng lỗi `404`.

## 4.4 DAO

Trong `user.productsDao.js`, hàm `getProductById(id)` làm 3 query chính:

1. Query thông tin sản phẩm tổng hợp:
- `sanpham`
- `danhmuc`
- `danhgia`
- `bienthesp` (để tính tổng tồn)

2. Query danh sách biến thể:

```sql
SELECT id, ma_sku, kichthuoc, mausac, soluong, hinhanh
FROM bienthesp
WHERE sanpham_id = ?
ORDER BY mausac, kichthuoc
```

3. Query ảnh phụ:

```sql
SELECT ten_file, thu_tu
FROM hinhanh_sanpham
WHERE sanpham_id = ?
ORDER BY thu_tu ASC
```

Sau đó gộp kết quả:

```js
product.bienthe = bienthe;
product.hinhanh_phu = hinhanhPhu.map(h => h.ten_file);
```

---

## 5) Dữ liệu API dùng trong trang chi tiết

| API | Method | Input | Output |
|---|---|---|---|
| `/api/products/:id` | GET | param `id` | `{ success, message, data }` |
| `/api/cart` | POST | `user_id, sanpham_id, bienthe_id?, soluong` | `{ success, message, data? }` |

Field frontend dùng mạnh nhất từ `data`:
- `tensanpham`, `mota`
- `giaban`, `giakhuyenmai`
- `hinhanh`
- `diem_danhgia`, `luot_danhgia`
- `tendanhmuc`, `danhmuc_slug`
- `bienthe[]`: `id`, `kichthuoc`, `mausac`, `soluong`, `hinhanh`

---

## 6) Frontend HTML: khung trang gồm những gì

Trong `productdetail.html` có các khối chính:

1. Breadcrumb:
- `#breadcrumb-category`
- `#breadcrumb-product`

2. State UI:
- `#loading-state` (đang tải)
- `#error-state` + `#error-message` (lỗi)

3. Khối sản phẩm chính `#product-detail`:
- Ảnh `#main-image`
- Tên `#product-name`
- Điểm sao `#star-icons`
- Giá `#price-sale`, `#price-original`, `#price-discount`
- Biến thể màu `#options-mausac`
- Biến thể size `#options-kichthuoc`
- Tồn kho `#stock-status`
- Số lượng `#qty-input`
- Nút `#btn-add-cart`, `#btn-buy-now`

4. Mô tả sản phẩm:
- `#product-mota`, `#mota-content`

---

## 7) Frontend JS: render và xử lý tương tác chi tiết

## 7.1 Khởi tạo và lấy id sản phẩm

Trong `productdetail.js`:

```js
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
```

Nếu `productId` không có -> hiển thị error state.

## 7.2 Hàm `init()`

```js
async function init() {
   const res = await api.get(`/products/${productId}`);
   renderProduct(res.data);
}

document.addEventListener('DOMContentLoaded', init);
```

Tác dụng:
- Đây là điểm vào chính của trang.
- Gọi API detail và render UI.

## 7.3 Hàm `renderProduct(product)`

Hàm này làm các việc lớn:

1. Đọc thông tin giá, giảm giá, tính `%` giảm.
2. Đổ dữ liệu text lên UI:
- tên sản phẩm,
- breadcrumb,
- rating,
- giá.
3. Đổ ảnh chính qua `imageUtil.product(product.hinhanh)`.
4. Lưu biến thể vào state:
- `currentBienthe`
- `selectedColor`
- `selectedSize`
5. Gọi render theo thứ tự:
- `renderColors()`
- `renderSizes(selectedColor)`
- `renderStock(variant)`
- `updateActionButtons(availableQty)`
6. Gắn lại event cho nút +/- số lượng.
7. Gắn event nút thêm giỏ.
8. Gắn event nút mua ngay.
9. Ẩn loading, hiện `#product-detail`.

## 7.4 Cụm hàm chọn biến thể

Các hàm liên kết với nhau:
- `renderColors()` dựng danh sách nút màu.
- `renderSizes(color)` dựng danh sách size theo màu.
- `getVariant(color, size)` lấy đúng biến thể đã chọn.
- `renderStock(variant)` hiển thị tồn kho.
- `updateActionButtons(availableQty)` bật/tắt nút mua.

Khi user bấm màu/size:
- `window.selectColor(color)` và `window.selectSize(size)` sẽ được gọi.
- Sau mỗi lần chọn, hệ thống render lại size/tồn kho/trạng thái nút.

## 7.5 Nút "Thêm vào giỏ"

Trong handler click:

```js
const res = await api.post('/cart', {
   user_id: Number(userId),
   sanpham_id: product.id,
   bienthe_id: variant?.id || null,
   soluong: qty
});
```

Tác dụng:
- Đẩy đúng sản phẩm + biến thể + số lượng vào giỏ.

## 7.6 Nút "Mua ngay"

Không gọi API order ngay lập tức.
Thay vào đó:

1. Tạo object `buyNowItem` chứa snapshot sản phẩm cần mua.
2. Lưu localStorage key `buy_now_item`.
3. Redirect:

```js
window.location.href = '/pages/checkout/checkout.html?mode=buynow';
```

Ý nghĩa:
- Checkout page sẽ đọc lại `buy_now_item` để tạo đơn nhánh mua ngay.

---

## 8) Sơ đồ gọi hàm rút gọn

```text
DOMContentLoaded
   -> init()
      -> api.get('/products/:id')
         -> backend route/validation/controller/service/dao
      -> renderProduct(product)
         -> renderColors()
         -> renderSizes()
         -> renderStock()
         -> updateActionButtons()

User action:
   A) Add to cart -> api.post('/cart', payload)
   B) Buy now -> localStorage.buy_now_item -> redirect checkout?mode=buynow
```

---

## 9) Lưu ý bảo trì
1. Logic lựa chọn biến thể phụ thuộc trực tiếp cấu trúc `bienthe[]` từ backend.
2. Nếu thay đổi tên field biến thể trong DB/API, cần sửa đồng thời `renderSizes`, `getVariant`, handler add-cart, handler buy-now.
3. Hiện UI sử dụng `alert()` cho thông báo; nếu chuyển sang toast component thì sửa tại handlers trong `renderProduct`.
