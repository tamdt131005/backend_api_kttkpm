# Chức năng: Quản lý danh mục admin

## 1) Mục tiêu chức năng
- Hiển thị danh sách danh mục và số sản phẩm theo từng danh mục.
- Tìm kiếm danh mục theo tên.
- Tạo mới, cập nhật và xóa danh mục.
- Đảm bảo không xóa được danh mục khi còn sản phẩm đang dùng.

## 2) File liên quan

## Backend
- `src/routes/admin.route.js`
- `src/controller/admin/admin.category.controller.js`
- `src/services/admin/admin.category.service.js`
- `src/services/admin/admin.shared.js`
- `src/dao/admin/admin.category.dao.js`

## Frontend
- `fontend/pages/admin/view/danhmuc_list.html`
- `fontend/pages/admin/view/danhmuc_add.html`
- `fontend/pages/admin/view/danhmuc_edit.html`
- `fontend/pages/admin/js/admin.common.js`
- `fontend/pages/admin/js/danhmuc_list.js`
- `fontend/pages/admin/js/danhmuc_add.js`
- `fontend/pages/admin/js/danhmuc_edit.js`
- `fontend/assets/js/api.js`

---

## 3) Luồng tổng thể theo chain hàm

1. Mở trang list `danhmuc_list.html`.
2. `danhmuc_list.js` chạy `init()`:
   - `bindEvents()`
   - `loadDanhMuc()`.
3. `loadDanhMuc()` gọi `adminApi.get('/danhmuc?keyword=...')`.
4. Backend xử lý theo chuỗi:
   - route `GET /danhmuc`
   - controller `getDanhMuc`
   - service `layDanhMuc`
   - dao `layDanhMuc` + `layThongKeDanhMuc`
   - MySQL.
5. Frontend gọi `renderTable(rows)` và `renderStats(thongke)`.
6. Khi xóa, list page gọi `DELETE /danhmuc/:id`.
7. Khi thêm/sửa, submit form gọi `POST/PUT` rồi redirect về list.

---

## 4) Backend chi tiết

## 4.1 Route

```js
router.get('/danhmuc', adminController.getDanhMuc);
router.get('/danhmuc/:id', adminController.getDanhMucById);
router.post('/danhmuc', adminController.themDanhMuc);
router.put('/danhmuc/:id', adminController.capNhatDanhMuc);
router.delete('/danhmuc/:id', adminController.xoaDanhMuc);
```

## 4.2 Controller chi tiết từng hàm

Trong `admin.category.controller.js`:

- `getDanhMuc(req, res)`:
  - đọc `keyword` từ `req.query`,
  - gọi service `layDanhMuc(keyword)`,
  - trả `200` với data.

- `getDanhMucById(req, res)`:
  - parse `id = Number(req.params.id)`,
  - gọi `layDanhMucById(id)`.

- `themDanhMuc(req, res)`:
  - truyền `req.body || {}` vào service,
  - trả `201` nếu tạo thành công.

- `capNhatDanhMuc(req, res)`:
  - parse id,
  - gọi `capNhatDanhMuc(id, req.body || {})`.

- `xoaDanhMuc(req, res)`:
  - parse id,
  - gọi `xoaDanhMuc(id)`.

Tất cả hàm controller dùng cùng pattern lỗi:

- `status = error.status || 500`
- body lỗi: `{ success: false, message: error.message || 'Loi Server' }`

## 4.3 Service `admin.category.service.js` theo từng bước

- `layDanhMuc(keyword)`:
  - bước 1: gọi DAO `layDanhMuc(keyword)` lấy danh sách.
  - bước 2: gọi DAO `layThongKeDanhMuc()` lấy tổng.
  - bước 3: return `{ danhsach, thongke }`.

- `themDanhMuc(payload)`:
  - bước 1: chuẩn hóa chuỗi:
    - `tendanhmuc = String(...).trim()`
    - `mota = String(...).trim()`
  - bước 2: validate `tendanhmuc` không rỗng.
  - bước 3: gọi `kiemTraTrungTenDanhMuc(tendanhmuc)`.
  - bước 4: nếu trùng thì throw `400`.
  - bước 5: tạo slug bằng `taoSlug(tendanhmuc)`.
  - bước 6: insert và trả dữ liệu danh mục mới.

- `capNhatDanhMuc(id, payload)`:
  - bước 1: chuẩn hóa input giống hàm tạo.
  - bước 2: validate tên không rỗng.
  - bước 3: `layDanhMucById(id)` để check tồn tại.
  - bước 4: `kiemTraTrungTenDanhMuc(tendanhmuc, id)` để check trùng loại trừ chính nó.
  - bước 5: tạo slug mới.
  - bước 6: update bản ghi.
  - bước 7: nếu `affectedRows <= 0` throw lỗi `400`.

- `xoaDanhMuc(id)`:
  - bước 1: check tồn tại danh mục.
  - bước 2: gọi `demSanPhamTheoDanhMuc(id)`.
  - bước 3: nếu số sản phẩm > 0 thì throw `400`.
  - bước 4: gọi `xoaDanhMuc(id)` ở DAO.

## 4.4 DAO `admin.category.dao.js` và SQL chính

- `layDanhMuc(keyword)`:
  - query join `danhmuc` với `sanpham` (lọc `deleted_at IS NULL`),
  - group theo danh mục,
  - trả thêm `sosanpham`.

- `layThongKeDanhMuc()`:
  - `SELECT COUNT(*) AS total FROM danhmuc`.

- `layDanhMucById(id)`:
  - query theo id, `LIMIT 1`.

- `kiemTraTrungTenDanhMuc(...)`:
  - hỗ trợ 2 mode:
    - tạo mới: kiểm tra trùng toàn bảng,
    - cập nhật: kiểm tra trùng nhưng loại trừ id hiện tại.

- `demSanPhamTheoDanhMuc(id)`:
  - đếm sản phẩm chưa xóa mềm thuộc danh mục.

- `xoaDanhMuc(id)`:
  - xóa vật lý bản ghi danh mục (không phải soft delete).

---

## 5) Frontend chi tiết

## 5.1 Danh sách (`danhmuc_list.js`)

- `renderTable(rows)`:
  - tìm phần tử `#danhmuc-table-body`,
  - nếu mảng rỗng thì render dòng `Không có dữ liệu`,
  - nếu có dữ liệu thì map từng row thành HTML:
    - id,
    - tên danh mục,
    - slug,
    - số sản phẩm,
    - action sửa/xóa.

- `renderStats(thongke)`:
  - gán `#stats-total` = `Number(thongke.total) || 0`.

- `loadDanhMuc()`:
  - đọc keyword từ query string,
  - đồng bộ vào input tìm kiếm,
  - gọi `adminApi.get('/danhmuc?keyword=...')`,
  - nếu thất bại thì render rỗng,
  - nếu thành công thì tách payload `danhsach`, `thongke` và render.

- `deleteDanhMuc(id)`:
  - xác nhận bằng `window.confirm`,
  - gọi `adminApi.delete('/danhmuc/:id')`,
  - nếu fail: alert message,
  - nếu ok: gọi lại `loadDanhMuc()`.

- `bindEvents()`:
  - submit form tìm kiếm -> dùng `setQuery({ keyword })`,
  - click delegation trên tbody để bắt nút có `data-delete-id`.

- `init()`:
  - gọi `bindEvents()` rồi `loadDanhMuc()`.

## 5.2 Thêm mới (`danhmuc_add.js`)

- `submitDanhMuc(event)`:
  - `event.preventDefault()`,
  - đọc `tendanhmuc`, `mota` từ form,
  - gọi `adminApi.post('/danhmuc', { tendanhmuc, mota })`,
  - nếu thành công redirect về `danhmuc_list.html`.

- `bindEvents()`:
  - bind submit cho `#danhmuc-form`.

## 5.3 Chỉnh sửa (`danhmuc_edit.js`)

- `loadDanhMuc()`:
  - lấy `currentId` từ query,
  - nếu thiếu id thì redirect về list,
  - gọi `adminApi.get('/danhmuc/:id')`,
  - đổ dữ liệu vào input `tendanhmuc`, `mota`.

- `submitDanhMuc(event)`:
  - gọi `adminApi.put('/danhmuc/:id', payload)`,
  - thành công thì quay lại list.

- `init()`:
  - `bindEvents()` trước,
  - `await loadDanhMuc()` sau.

---

## 6) Input/Output API chính

| API | Method | Input | Output |
|---|---|---|---|
| `/api/admin/danhmuc` | GET | query `keyword` | `{ success, data: { danhsach, thongke } }` |
| `/api/admin/danhmuc/:id` | GET | path `id` | `{ success, data: danhmuc }` |
| `/api/admin/danhmuc` | POST | body `tendanhmuc`, `mota` | `{ success, data: { danhmuc_id, tendanhmuc, slug, mota } }` |
| `/api/admin/danhmuc/:id` | PUT | body `tendanhmuc`, `mota` | `{ success, data: { danhmuc_id, tendanhmuc, slug, mota } }` |
| `/api/admin/danhmuc/:id` | DELETE | path `id` | `{ success, data: { danhmuc_id } }` |

---

## 7) Nhánh lỗi và regression cần chú ý

- `POST/PUT` với `tendanhmuc` rỗng -> `400`.
- `POST/PUT` trùng tên danh mục -> `400`.
- `PUT/DELETE` với id không tồn tại -> `404`.
- `DELETE` danh mục còn sản phẩm -> `400`.

Checklist test nhanh:

1. Tạo danh mục mới thành công.
2. Tạo danh mục trùng tên bị chặn.
3. Sửa danh mục đổi tên thành tên đã tồn tại bị chặn.
4. Xóa danh mục không có sản phẩm thành công.
5. Xóa danh mục có sản phẩm bị chặn đúng message.
