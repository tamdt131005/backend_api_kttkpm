# Chức năng: Trang quản trị admin

## 1) Mục tiêu chức năng
- Là trang điều hướng trung tâm cho toàn bộ nghiệp vụ quản trị.
- Kiểm tra quyền truy cập admin trước khi hiển thị nội dung.
- Cung cấp lối vào các module: đơn hàng, nhập hàng, tồn kho, sản phẩm, danh mục.

## 2) File liên quan

## Backend
- `src/routes/admin.route.js`
- `src/controller/admin/admin.dashboard.controller.js`
- `src/services/admin/admin.dashboard.service.js`
- `src/dao/admin/admin.order.dao.js`
- `src/dao/admin/admin.product.dao.js`
- `src/dao/admin/admin.category.dao.js`
- `src/dao/admin/admin.stock.dao.js`

## Frontend
- `fontend/pages/admin/index.html`
- `fontend/pages/admin/js/admin.common.js`
- `fontend/assets/js/api.js`

---

## 3) Luồng khởi tạo trang theo từng bước code

1. Trình duyệt mở `fontend/pages/admin/index.html`.
2. HTML nạp theo thứ tự script:
   - `../../assets/js/api.js`
   - `./js/admin.common.js`
3. Trong `admin.common.js`, listener `DOMContentLoaded` chạy ngay khi DOM sẵn sàng.
4. Listener gọi `ensureAdminAccess()`:
   - đọc `isLoggedIn` trong localStorage,
   - đọc `role` trong localStorage,
   - nếu không phải admin thì redirect sang trang login.
5. Nếu pass điều kiện quyền, tiếp tục gọi `renderAdminTopbar()` để gắn topbar chung.
6. Người dùng chọn card menu để điều hướng sang từng trang quản trị chi tiết.

---

## 4) Phân tích chi tiết hàm trong `admin.common.js`

## 4.1 Nhóm hàm tiện ích dữ liệu hiển thị

- `formatCurrency(value)`:
  - ép số qua `Number(value) || 0`,
  - format theo `vi-VN`,
  - nối hậu tố `VND`.

- `formatDate(value)`:
  - parse date từ input,
  - nếu date không hợp lệ thì trả chuỗi rỗng,
  - nếu hợp lệ thì trả `dd/mm/yyyy`.

- `escapeHtml(value)`:
  - thay thế các ký tự nguy hiểm `& < > " '` để tránh chèn HTML trực tiếp khi render table.

## 4.2 Nhóm hàm query string

- `getQuery(name)`:
  - tạo `URL(window.location.href)`,
  - trả `searchParams.get(name)` hoặc chuỗi rỗng.

- `setQuery(query)`:
  - duyệt từng key trong object,
  - nếu value rỗng thì xóa khỏi query,
  - nếu có giá trị thì set lại query,
  - gán `window.location.href` để reload theo URL mới.

## 4.3 Nhóm hàm route base path

- `getFrontendBasePath()`:
  - dò marker `/fontend/` trong `window.location.pathname`,
  - cắt path để lấy base frontend,
  - dùng cho redirect nhất quán dù deploy trong thư mục con.

- `withFrontendBase(path)`:
  - nếu path là URL tuyệt đối thì trả nguyên,
  - nếu path tương đối thì nối với `FRONTEND_BASE_PATH`.

## 4.4 Guard và logout

- `ensureAdminAccess()`:
  - điều kiện pass: `isLoggedIn === 'true'` và `role.toLowerCase() === 'admin'`.
  - nếu fail thì redirect login và trả `false`.

- `adminLogout()`:
  - xóa toàn bộ key phiên người dùng,
  - redirect về login bằng `withFrontendBase('/pages/auth/login.html')`.

## 4.5 Topbar và API wrapper

- `renderAdminTopbar()`:
  - tạo `header.admin-topbar` bằng `document.createElement`,
  - render brand, nav links, user info,
  - bind click nút đăng xuất.

- `adminApi`:
  - chuẩn hóa endpoint admin:
    - `adminApi.get('/danhmuc')` -> `api.get('/admin/danhmuc')`
    - `adminApi.upload('/sanpham/upload-anh', formData)` -> `api.upload('/admin/sanpham/upload-anh', formData)`.

---

## 5) Phân tích endpoint dashboard (backend)

## 5.1 Route

Trong `src/routes/admin.route.js`:

```js
router.get('/dashboard', adminController.getDashboard);
```

## 5.2 Controller `getDashboard`

Trong `src/controller/admin/admin.dashboard.controller.js`:

1. gọi `adminDashboardService.layDashboard()`.
2. nếu thành công trả `200` với `{ success: true, data }`.
3. nếu lỗi:
   - lấy `error.status || 500`,
   - trả `{ success: false, message }`.

## 5.3 Service `layDashboard`

Trong `src/services/admin/admin.dashboard.service.js`, hàm chạy tuần tự:

1. `adminOrderDAO.thongKeDonHang()`.
2. `adminProductDAO.layThongKeSanPham()`.
3. `adminCategoryDAO.layThongKeDanhMuc()`.
4. `adminStockDAO.layThongKeTonKho()`.
5. `adminOrderDAO.layTongDoanhThu()`.

Sau đó gom về object:

```json
{
  "donhang": {},
  "sanpham": {},
  "danhmuc": {},
  "tonkho": {},
  "tongdoanhthu": 0
}
```

Lưu ý: trang `admin/index.html` hiện chưa gọi endpoint này, mới dừng ở vai trò menu điều hướng.

---

## 6) Điều hướng chính từ trang admin

Map card menu trong `index.html`:

- `./view/donhang_list.html` -> Quản lý đơn hàng.
- `./nhaphang_list.html` -> Quản lý nhập hàng.
- `./tonkho_list.html` -> Theo dõi tồn kho.
- `./view/sanpham_list.html` -> Quản lý sản phẩm.
- `./view/danhmuc_list.html` -> Quản lý danh mục.

Khi cần trace bug điều hướng, kiểm tra theo thứ tự:

1. `href` ở card trong `index.html`.
2. Guard `ensureAdminAccess()` có chặn redirect không.
3. Base path từ `getFrontendBasePath()` có đúng môi trường chạy không.

---

## 7) Nhánh lỗi thường gặp và cách đọc nhanh

- Vừa mở trang đã bị đẩy về login:
  - kiểm tra `isLoggedIn`, `role` trong localStorage.

- Topbar không hiện:
  - có thể guard fail trước khi `renderAdminTopbar()` chạy,
  - hoặc script `admin.common.js` không được load.

- Link menu bấm không mở đúng trang:
  - kiểm tra cấu trúc thư mục thực tế trong `fontend/pages/admin`.

