# Chức năng: Quản lý sản phẩm admin

## 1) Mục tiêu chức năng
- Xem danh sách sản phẩm theo từ khóa.
- Hiển thị thống kê tổng số sản phẩm, còn hàng, hết hàng.
- Thêm mới, cập nhật, xóa mềm sản phẩm.
- Upload ảnh sản phẩm trực tiếp từ giao diện admin.

## 2) File liên quan

## Backend
- `src/routes/admin.route.js`
- `src/controller/admin/admin.product.controller.js`
- `src/services/admin/admin.product.service.js`
- `src/services/admin/admin.shared.js`
- `src/dao/admin/admin.product.dao.js`
- `src/dao/admin/admin.category.dao.js`

## Frontend
- `fontend/pages/admin/view/sanpham_list.html`
- `fontend/pages/admin/view/sanpham_add.html`
- `fontend/pages/admin/view/sanpham_edit.html`
- `fontend/pages/admin/js/admin.common.js`
- `fontend/pages/admin/js/sanpham_list.js`
- `fontend/pages/admin/js/sanpham_add.js`
- `fontend/pages/admin/js/sanpham_edit.js`
- `fontend/assets/js/api.js`
- `fontend/assets/js/image.js`

---

## 3) Luồng tổng thể theo chain hàm

1. Mở list `sanpham_list.html` -> `sanpham_list.js` chạy `init()`.
2. `init()` gọi `bindEvents()` và `loadSanPham()`.
3. `loadSanPham()` gọi `GET /api/admin/sanpham?keyword=...`.
4. Backend chạy route -> controller -> service -> dao.
5. Frontend render table + stats.
6. Từ list:
  - bấm Thêm -> `sanpham_add.html`.
  - bấm Sửa -> `sanpham_edit.html?id=...`.
  - bấm Xóa -> gọi `DELETE /api/admin/sanpham/:id`.
7. Tại add/edit:
  - có thể upload ảnh trước bằng `POST /api/admin/sanpham/upload-anh`,
  - sau đó submit create/update.

---

## 4) Backend chi tiết

## 4.1 Route

```js
router.get('/sanpham', adminController.getSanPham);
router.get('/sanpham/:id', adminController.getSanPhamById);
router.post('/sanpham/upload-anh', uploadProductImage.single('hinhanh'), adminController.uploadAnhSanPham);
router.post('/sanpham', adminController.themSanPham);
router.put('/sanpham/:id', adminController.capNhatSanPham);
router.delete('/sanpham/:id', adminController.xoaSanPham);
```

## 4.2 Controller chi tiết từng hàm

Trong `admin.product.controller.js`:

- `getSanPham`:
  - đọc `keyword` từ query,
  - gọi `adminProductService.laySanPham(keyword)`.

- `getSanPhamById`:
  - parse `id` từ params,
  - gọi service lấy chi tiết.

- `themSanPham`:
  - truyền body trực tiếp vào service,
  - trả `201` khi tạo thành công.

- `capNhatSanPham`:
  - parse id,
  - truyền body vào service cập nhật.

- `uploadAnhSanPham`:
  - check `req.file`.
  - nếu thiếu file -> trả `400` ngay.
  - nếu có file:
    - tạo `hinhanh = product/<filename>`
    - tạo `url` public từ host hiện tại,
    - trả `201` với dữ liệu ảnh.

- `xoaSanPham`:
  - parse id,
  - gọi service xóa mềm.

Controller dùng chung 1 pattern xử lý lỗi:

- `status = error.status || 500`
- trả `{ success: false, message }`.

## 4.3 Service `admin.product.service.js` theo từng bước

- `laySanPham(keyword)`:
  - gọi `adminProductDAO.laySanPham(keyword)`,
  - gọi `adminProductDAO.layThongKeSanPham()`,
  - return `{ danhsach, thongke }`.

- `themSanPham(payload)`:
  - bước 1: chuẩn hóa toàn bộ field body:
    - string: `tensanpham`, `thuonghieu`, `mota`, `hinhanh`
    - number: `danhmuc_id`, `giaban`, `giakhuyenmai`, `soluong`, `an_hien`
  - bước 2: validate nghiệp vụ:
    - tên bắt buộc,
    - danh mục phải là số nguyên > 0,
    - giá bán > 0,
    - giá khuyến mãi là `null` hoặc >= 0.
  - bước 3: check danh mục tồn tại qua `adminCategoryDAO.kiemTraDanhMucTonTai`.
  - bước 4: tạo slug bằng `taoSlug(tensanpham)`.
  - bước 5: insert sản phẩm.
  - bước 6: gọi `upsertBienTheMacDinh(sanpham_id, soluong)` để đồng bộ tồn kho mặc định.

- `capNhatSanPham(id, payload)`:
  - bước 1: lấy sản phẩm cũ, nếu không có -> `404`.
  - bước 2: chuẩn hóa + validate payload tương tự hàm tạo.
  - bước 3: check danh mục tồn tại.
  - bước 4: update sản phẩm.
  - bước 5: nếu `soluong` là số hợp lệ thì cập nhật biến thể mặc định.

- `xoaSanPham(id)`:
  - bước 1: check sản phẩm tồn tại.
  - bước 2: gọi DAO xóa mềm (`deleted_at`, `an_hien = 0`).

## 4.4 DAO `admin.product.dao.js` và SQL chính

- `laySanPham(keyword)`:
  - join `sanpham`, `danhmuc`, `bienthesp`,
  - group để tính `COALESCE(SUM(bt.soluong), 0) AS tonkho`.

- `layThongKeSanPham()`:
  - thống kê tổng số sản phẩm,
  - đếm sản phẩm hết hàng và còn hàng theo tổng tồn biến thể.

- `laySanPhamById(id)`:
  - lấy dữ liệu sản phẩm chưa xóa mềm,
  - lấy thêm biến thể mặc định `ma_sku = SP{id}-DEFAULT` để đọc `soluong`.

- `themSanPham(...)`:
  - insert bản ghi sản phẩm mới.

- `capNhatSanPham(...)`:
  - update thông tin sản phẩm theo id.

- `xoaSanPham(id)`:
  - soft delete bằng `deleted_at`.

- `upsertBienTheMacDinh(sanphamId, soluong)`:
  - tìm biến thể mặc định theo `ma_sku`.
  - nếu có thì update `soluong`.
  - nếu chưa có thì insert mới biến thể mặc định.

## 4.5 Upload ảnh sản phẩm

`uploadAnhSanPham` nhận file field `hinhanh`:

- chỉ chấp nhận MIME image,
- giới hạn 2MB,
- lưu vào `src/upload/img/product`,
- trả về:
  - `hinhanh`: dạng `product/<filename>`
  - `url`: URL truy cập ảnh.

---

## 5) Frontend chi tiết

## 5.1 Danh sách (`sanpham_list.js`)

- `renderTable(rows)`:
  - render trạng thái rỗng nếu không có dữ liệu,
  - nếu có thì map từng dòng thành table row:
    - id, tên, danh mục, giá bán, giá KM, tồn kho,
    - action sửa/xóa.

- `renderStats(thongke)`:
  - set text cho `stats-total`, `stats-conhang`, `stats-hethang`.

- `loadSanPham()`:
  - đọc `keyword` từ query,
  - đồng bộ input tìm kiếm,
  - gọi `adminApi.get('/sanpham?keyword=...')`,
  - tách payload và render.

- `deleteSanPham(id)`:
  - confirm,
  - gọi `adminApi.delete('/sanpham/:id')`,
  - thành công thì reload list.

- `bindEvents()`:
  - submit form search -> `setQuery({ keyword })`,
  - click delegation trong tbody để bắt `data-delete-id`.

## 5.2 Thêm mới (`sanpham_add.js`)

- `loadDanhMuc()`:
  - gọi `GET /api/admin/danhmuc`,
  - lấy `res.data.danhsach`,
  - render options danh mục.

- `taoUrlXemTruocAnh(hinhanh)`:
  - nếu có `imageUtil.product` thì dùng helper đó,
  - nếu là URL tuyệt đối thì giữ nguyên,
  - nếu là đường dẫn tương đối thì ghép host upload.

- `renderPreview(hinhanh)`:
  - có URL thì hiện ảnh,
  - không có thì ẩn ảnh preview.

- `uploadHinhAnh()`:
  - lấy file từ input,
  - validate:
    - file tồn tại,
    - MIME bắt đầu bằng `image/`,
    - dung lượng <= 2MB,
  - gọi `adminApi.upload('/sanpham/upload-anh', formData)`,
  - ghi `hinhanh` vào input text,
  - render preview ngay.

- `submitSanPham(event)`:
  - gom payload từ form,
  - gọi `adminApi.post('/sanpham', payload)`,
  - thành công thì quay về list.

## 5.3 Chỉnh sửa (`sanpham_edit.js`)

- `loadSanPham()`:
  - đọc id từ query,
  - gọi `GET /sanpham/:id`,
  - gọi `loadDanhMuc(sp.danhmuc_id)`,
  - đổ dữ liệu lên form,
  - render preview ảnh hiện tại.

- `uploadHinhAnh()`:
  - giống add page.

- `submitSanPham(event)`:
  - gom payload,
  - gọi `PUT /sanpham/:id`,
  - thành công quay về list.

---

## 6) Input/Output API chính

| API | Method | Input | Output |
|---|---|---|---|
| `/api/admin/sanpham` | GET | query `keyword` | `{ success, data: { danhsach, thongke } }` |
| `/api/admin/sanpham/:id` | GET | path `id` | `{ success, data: sanpham }` |
| `/api/admin/sanpham/upload-anh` | POST | multipart `hinhanh` | `{ success, data: { hinhanh, url } }` |
| `/api/admin/sanpham` | POST | body thông tin sản phẩm | `{ success, data: { sanpham_id, tensanpham, slug } }` |
| `/api/admin/sanpham/:id` | PUT | body thông tin sản phẩm | `{ success, data: { sanpham_id, tensanpham, slug } }` |
| `/api/admin/sanpham/:id` | DELETE | path `id` | `{ success, data: { sanpham_id } }` |

---

## 7) Nhánh lỗi và regression cần chú ý

- Tạo/sửa với `danhmuc_id` không tồn tại -> `400`.
- Tạo/sửa với `giaban <= 0` -> `400`.
- Mở trang sửa với id không tồn tại -> alert và redirect về list.
- Upload file không phải ảnh hoặc >2MB -> bị chặn ở frontend trước khi gọi API.

Checklist test nhanh:

1. Tạo sản phẩm với ảnh upload.
2. Sửa sản phẩm đổi ảnh.
3. Xóa sản phẩm và kiểm tra không còn xuất hiện ở list admin.
4. Xác nhận sản phẩm bị xóa mềm (không mất dữ liệu vật lý).
