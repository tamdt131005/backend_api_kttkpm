# Chức năng: Quản lý đơn hàng admin

## 1) Mục tiêu chức năng
- Xem danh sách đơn hàng theo trạng thái.
- Tìm kiếm đơn hàng theo mã đơn, tên khách, email hoặc số điện thoại.
- Cập nhật trạng thái đơn hàng theo luồng tuần tự.
- Xem chi tiết từng đơn hàng và danh sách sản phẩm trong đơn.

## 2) File liên quan

## Backend
- `src/routes/admin.route.js`
- `src/controller/admin/admin.order.controller.js`
- `src/services/admin/admin.order.service.js`
- `src/services/admin/admin.shared.js`
- `src/dao/admin/admin.order.dao.js`

## Frontend
- `fontend/pages/admin/view/donhang_list.html` (redirect)
- `fontend/pages/admin/view/donhang_all.html`
- `fontend/pages/admin/view/donhang_choxacnhan.html`
- `fontend/pages/admin/view/donhang_dangxuly.html`
- `fontend/pages/admin/view/donhang_danggiao.html`
- `fontend/pages/admin/view/donhang_dagiao.html`
- `fontend/pages/admin/view/donhang_detail.html`
- `fontend/pages/admin/js/admin.common.js`
- `fontend/pages/admin/js/donhang_list.js`
- `fontend/pages/admin/js/donhang_detail.js`
- `fontend/assets/js/api.js`

---

## 3) Luồng tổng thể theo chain hàm

1. Admin vào một trong các trang tab đơn hàng:
  - all,
  - chờ xác nhận,
  - đang xử lý,
  - đang giao,
  - đã giao.
2. `donhang_list.js` chạy `init()`:
  - `renderMessage()`
  - `highlightStatusTab()`
  - `bindEvents()`
  - `loadDonHang()`.
3. `loadDonHang()` gọi `GET /api/admin/donhang?trangthai=...&keyword=...`.
4. Backend xử lý route -> controller -> service -> dao.
5. Frontend render:
  - table đơn,
  - stats theo trạng thái,
  - tổng doanh thu.
6. Bấm nút chuyển trạng thái -> gọi `PATCH /api/admin/donhang/:id/trangthai`.
7. Bấm chi tiết -> mở `donhang_detail.html?id=...` và gọi `GET /api/admin/donhang/:id`.

---

## 4) Backend chi tiết

## 4.1 Route

Trong `src/routes/admin.route.js`:

```js
router.get('/donhang', adminController.getDonHang);
router.get('/donhang/:id', adminController.getChiTietDonHang);
router.patch('/donhang/:id/trangthai', adminController.capNhatTrangThaiDonHang);
router.patch('/donhang/:id/trangthai-thanhtoan', adminController.capNhatTrangThaiThanhToan);
```

## 4.2 Controller chi tiết từng hàm

Trong `admin.order.controller.js`:

- `getDonHang`:
  - đọc `trangthai`, `keyword` từ query,
  - gọi `layDanhSachDonHang(trangthai, keyword)`.

- `getChiTietDonHang`:
  - parse `donhangId` từ params,
  - gọi `layChiTietDonHang(donhangId)`.

- `capNhatTrangThaiDonHang`:
  - parse id,
  - đọc body `trangthai`, `nguoidung_id`,
  - gọi service cập nhật trạng thái.

- `capNhatTrangThaiThanhToan`:
  - parse id,
  - đọc body `trangthai`,
  - gọi service cập nhật thanh toán.

Lỗi controller theo pattern chung:

- `status = error.status || 500`,
- trả `{ success: false, message }`.

## 4.3 Service `admin.order.service.js` theo từng hàm

- `layDanhSachDonHang(trangthai, keyword)`:
  - bước 1: chuẩn hóa `trangthai` bằng `chuanHoaTrangThaiDonHang(..., { allowAll: true })`.
  - bước 2: nếu không hợp lệ -> throw `400`.
  - bước 3: lấy danh sách raw từ DAO.
  - bước 4: map từng đơn qua `chuanHoaDuLieuDonHang(...)`.
  - bước 5: gọi thêm `thongKeDonHang()` và `layTongDoanhThu()`.

- `layChiTietDonHang(donhangId)`:
  - bước 1: lấy chi tiết từ DAO.
  - bước 2: nếu không có -> throw `404`.
  - bước 3: chuẩn hóa trạng thái.
  - bước 4: trả thêm `trangthai_tiep_theo` bằng `layTrangThaiTiepTheo`.

- `capNhatTrangThaiDonHang(donhangId, trangthaiMoi, nguoidungId)`:
  - bước 1: chuẩn hóa trạng thái mới, validate hợp lệ.
  - bước 2: lấy đơn hiện tại, nếu không có -> `404`.
  - bước 3: đọc trạng thái hiện tại đã chuẩn hóa.
  - bước 4: chặn các trường hợp:
    - đơn đã giao,
    - đơn đã hủy,
    - set lại cùng trạng thái,
    - quay lùi trạng thái,
    - nhảy quá 1 bước.
  - bước 5: update `donhang.trangthai`.
  - bước 6: insert lịch sử vào `lichsu_donhang`.

- `capNhatTrangThaiThanhToan(donhangId, trangthaiMoi)`:
  - bước 1: chuẩn hóa trạng thái thanh toán.
  - bước 2: validate thuộc whitelist.
  - bước 3: check đơn tồn tại.
  - bước 4: update `trangthai_thanhtoan`.

## 4.4 Quy tắc trạng thái từ `admin.shared.js`

`src/services/admin/admin.shared.js` định nghĩa:

- chuỗi chuẩn: `choxacnhan -> dangxuly -> danggiao -> dagiao`
- map chuẩn hóa từ alias cũ (`daxacnhan` -> `dangxuly`)
- trạng thái thanh toán hợp lệ:
  - `chuathanhtoan`
  - `dathanhtoan`
  - `hoantien`

## 4.5 DAO `admin.order.dao.js` và SQL chính

- `layTatCaDonHang(trangthai, keyword)`:
  - query join `donhang`, `users`, `diachigiaohang`.
  - lọc theo `trangthai` nếu có.
  - lọc keyword trên mã đơn, fullname, email, phone.

- `layChiTietDonHang(donhangId)`:
  - query 1: header đơn hàng.
  - query 2: danh sách sản phẩm từ `chitietdonhang` join `sanpham`.

- `capNhatTrangThaiDonHang` và `capNhatTrangThaiThanhToan`:
  - update từng cột tương ứng.

- `themLichSuDonHang(...)`:
  - insert bản ghi log thay đổi trạng thái.

- `thongKeDonHang()`:
  - group theo trạng thái,
  - chuẩn hóa `daxacnhan` thành `dangxuly` khi thống kê.

- `layTongDoanhThu()`:
  - SUM `tongthanhtoan` với điều kiện `trangthai = 'dagiao'`.

---

## 5) Frontend chi tiết

## 5.1 Danh sách đơn (`donhang_list.js`)

- `renderMessage()`:
  - đọc `msg`, `text` từ query,
  - hiển thị banner thành công/lỗi đầu trang.

- `getCurrentStatus()`:
  - đọc `document.body.dataset.status` để biết tab hiện tại.

- `highlightStatusTab()`:
  - duyệt tất cả link có `data-status-link`,
  - gắn class `active` đúng tab đang mở.

- `renderStats(thongke, tongdoanhthu)`:
  - update toàn bộ ô thống kê số lượng theo trạng thái,
  - format tiền cho tổng doanh thu.

- `renderActions(row)`:
  - luôn có nút `Chi tiết`.
  - nếu có trạng thái kế tiếp thì thêm nút `Chuyển sang ...`.

- `renderTable(rows)`:
  - render table rỗng khi không có dữ liệu,
  - render table đầy đủ khi có dữ liệu.

- `loadDonHang()`:
  - đọc `status` và `keyword`,
  - tạo query params,
  - gọi `adminApi.get('/donhang?...')`,
  - render table + stats.

- `capNhatTrangThai(donhangId, trangthai)`:
  - gọi `PATCH /donhang/:id/trangthai`,
  - thành công thì load lại danh sách.

- `bindEvents()`:
  - submit search form,
  - click delegation nút chuyển trạng thái.

- `init()`:
  - gọi lần lượt message -> tab -> bind -> load.

## 5.2 Chi tiết đơn (`donhang_detail.js`)

- `loadOrder()`:
  - đọc id từ query,
  - gọi `GET /donhang/:id`,
  - lưu vào `currentOrder`,
  - gọi các hàm render.

- `renderInfo(order)`:
  - render grid thông tin đơn,
  - render text trạng thái đơn và trạng thái thanh toán.

- `renderProgress(order)`:
  - dựng tiến trình 4 bước:
    - `choxacnhan`,
    - `dangxuly`,
    - `danggiao`,
    - `dagiao`.

- `renderProducts(order)`:
  - render bảng chi tiết sản phẩm trong đơn.

- `renderNextAction(order)`:
  - ẩn nút nếu không còn trạng thái kế tiếp,
  - nếu còn thì set text nút `Chuyển sang ...`.

- `onClickNextStatus()`:
  - xác nhận,
  - gọi patch cập nhật trạng thái,
  - reload chi tiết đơn.

---

## 6) Input/Output API chính

| API | Method | Input | Output |
|---|---|---|---|
| `/api/admin/donhang` | GET | query `trangthai`, `keyword` | `{ success, data: { danhsach, thongke, tongdoanhthu } }` |
| `/api/admin/donhang/:id` | GET | path `id` | `{ success, data: { ...donhang, sanpham[] } }` |
| `/api/admin/donhang/:id/trangthai` | PATCH | body `trangthai`, `nguoidung_id?` | `{ success, data: { trangthai_cu, trangthai_moi } }` |
| `/api/admin/donhang/:id/trangthai-thanhtoan` | PATCH | body `trangthai` | `{ success, data: { trangthai_thanhtoan_cu, trangthai_thanhtoan_moi } }` |

---

## 7) Ghi chú quan trọng

- `donhang_list.html` chỉ làm nhiệm vụ redirect sang `donhang_all.html`.
- Các trang trạng thái khác nhau dùng chung `donhang_list.js`; khác nhau ở `data-status` trên thẻ `body`.
- Frontend hiện tại chưa có nút cập nhật `trangthai-thanhtoan`, dù backend đã hỗ trợ endpoint.

---

## 8) Ma trận chuyển trạng thái đơn hàng

| Trạng thái hiện tại | Trạng thái được phép chuyển tiếp |
|---|---|
| `choxacnhan` | `dangxuly` |
| `dangxuly` | `danggiao` |
| `danggiao` | `dagiao` |
| `dagiao` | không được chuyển |
| `dahuy` | không được chuyển |

Service sẽ chặn:

- quay lùi,
- nhảy cóc,
- set lại cùng trạng thái,
- cập nhật đơn đã kết thúc.
