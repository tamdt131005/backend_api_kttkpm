# Chức năng: Quản lý nhập hàng admin

## 1) Mục tiêu chức năng
- Xem lịch sử các phiếu nhập kho.
- Lập phiếu nhập mới theo nhiều dòng biến thể sản phẩm.
- Tự động cộng tồn kho biến thể khi lưu phiếu.
- Theo dõi tổng số lượng và tổng tiền nhập.

## 2) File liên quan

## Backend
- `src/routes/admin.route.js`
- `src/controller/admin/admin.import.controller.js`
- `src/services/admin/admin.import.service.js`
- `src/controller/admin/admin.stock.controller.js`
- `src/services/admin/admin.stock.service.js`
- `src/dao/admin/admin.import.dao.js`
- `src/dao/admin/admin.stock.dao.js`
- `src/config/db.js`

## Frontend
- `fontend/pages/admin/nhaphang_list.html`
- `fontend/pages/admin/nhaphang_add.html`
- `fontend/pages/admin/js/admin.common.js`
- `fontend/pages/admin/js/nhaphang_list.js`
- `fontend/pages/admin/js/nhaphang_add.js`
- `fontend/assets/js/api.js`

---

## 3) Luồng tổng thể theo chain hàm

1. Mở list `nhaphang_list.html`.
2. `nhaphang_list.js` chạy `init()`:
  - `renderMessage()`
  - `bindForm()`
  - `loadDanhSachNhapHang()`.
3. `loadDanhSachNhapHang()` gọi `GET /api/admin/nhaphang?keyword=...`.
4. Backend xử lý route -> controller -> service -> dao.
5. Frontend render bảng lịch sử nhập + thống kê.
6. Khi bấm thêm phiếu, mở `nhaphang_add.html`.
7. `nhaphang_add.js` chạy `init()`:
  - `loadDanhSachBienThe()`
  - `bindEvents()`
  - `themDong()` để tạo dòng nhập đầu tiên.
8. Submit form gửi `POST /api/admin/nhaphang`.
9. Backend tạo phiếu trong transaction và cộng tồn kho biến thể.

---

## 4) Backend chi tiết

## 4.1 Route

```js
router.get('/nhaphang', adminController.getNhapHang);
router.post('/nhaphang', adminController.themPhieuNhap);
router.get('/bienthe', adminController.getBienThe);
```

## 4.2 Controller chi tiết từng hàm

Trong `admin.import.controller.js`:

- `getNhapHang(req, res)`:
  - đọc `keyword` từ query,
  - gọi `adminImportService.layNhapHang(keyword)`,
  - trả `200` cùng dữ liệu tổng hợp.

- `themPhieuNhap(req, res)`:
  - truyền body vào service,
  - trả `201` nếu tạo thành công.

Trong `admin.stock.controller.js` (endpoint hỗ trợ nhập hàng):

- `getBienThe(req, res)`:
  - đọc `keyword`,
  - gọi `adminStockService.layDanhSachBienThe(keyword)`.

## 4.3 Service `admin.import.service.js` theo từng bước

- `layNhapHang(keyword)`:
  - bước 1: gọi DAO lấy danh sách rows.
  - bước 2: lặp từng row để cộng dồn:
    - `tongTien += thanhtien`
    - `tongSoLuong += soluong`
  - bước 3: trả `{ data, tongTien, tongSoLuong }`.

- `chuanHoaRowsNhapHang(payload)`:
  - hỗ trợ 2 cấu trúc body:
    - kiểu mới: `rows[]`.
    - kiểu cũ: các mảng song song `bienthe_id[]`, `soluong[]`, `dongia[]`, `ghichu[]`.
  - nếu kiểu cũ thì hàm tự zip thành `rows` theo index.

- `themPhieuNhap(payload)`:
  - bước 1: chuẩn hóa `ghichu_phieu`, `nha_cung_cap`, `nguoitao_id`.
  - bước 2: gọi `chuanHoaRowsNhapHang(payload)`.
  - bước 3: map sang number và filter row hợp lệ (`bienthe_id`, `soluong`, `dongia` đều > 0).
  - bước 4: nếu không còn row hợp lệ -> throw `400`.
  - bước 5: tính `tongtien` phiếu.
  - bước 6: mở transaction từ `pool.getConnection()`.
  - bước 7: tạo phiếu nhập.
  - bước 8: duyệt từng row:
    - check biến thể tồn tại,
    - insert chi tiết phiếu,
    - cộng tồn kho biến thể.
  - bước 9: commit nếu toàn bộ thành công.
  - bước 10: rollback nếu có bất kỳ lỗi nào.

## 4.4 DAO nhập hàng chi tiết

- `layBienTheById(connection, bientheId)`:
  - kiểm tra biến thể có tồn tại trước khi nhập kho.

- `taoPhieuNhap(connection, payload)`:
  - insert bảng `phieunhap`,
  - trả `insertId` làm mã phiếu.

- `taoChiTietPhieuNhap(connection, row)`:
  - insert từng dòng chi tiết vào `chitietphieunhap`.

- `congTonKhoBienThe(connection, bientheId, soluong, dongia)`:
  - update tồn kho bằng phép cộng dồn,
  - cập nhật luôn `gia_nhap` gần nhất.

- `layDanhSachPhieuNhap(keyword)`:
  - join `phieunhap`, `chitietphieunhap`, `bienthesp`, `sanpham`,
  - lọc theo tên sản phẩm,
  - order theo phiếu mới nhất và thứ tự dòng chi tiết.

---

## 5) Frontend chi tiết

## 5.1 Danh sách phiếu nhập (`nhaphang_list.js`)

- `renderMessage()`:
  - đọc query `msg`, `text` để hiển thị banner sau khi vừa tạo phiếu thành công.

- `renderTable(rows)`:
  - nếu không có rows -> render dòng trống.
  - nếu có rows -> render từng dòng:
    - mã phiếu,
    - ngày nhập,
    - sản phẩm,
    - phân loại,
    - số lượng,
    - đơn giá,
    - thành tiền,
    - ghi chú.

- `renderStats(rows, tongSoLuong, tongTien)`:
  - tổng dòng,
  - tổng số lượng,
  - tổng tiền.

- `loadDanhSachNhapHang()`:
  - đọc keyword từ query,
  - gọi API,
  - render bảng và thống kê.

- `bindForm()`:
  - submit tìm kiếm -> setQuery để reload với query mới.

## 5.2 Tạo phiếu nhập (`nhaphang_add.js`)

- `loadDanhSachBienThe()`:
  - gọi `GET /api/admin/bienthe`,
  - lưu danh sách vào biến global `danhSachBienThe`,
  - gọi `renderBienTheOptions()` đổ datalist.

- `ganSuKienTimSanPham(row)`:
  - bind event `change` cho input tên biến thể,
  - tìm match trong `danhSachBienThe`,
  - nếu match thì gán `bienthe_id` vào hidden input.

- `themDong()`:
  - clone dòng mẫu `#dongMau`,
  - reset input rỗng,
  - append vào tbody,
  - bind tìm biến thể cho dòng mới,
  - cập nhật số thứ tự dòng.

- `xoaDong(btn)`:
  - xóa dòng hiện tại,
  - nhưng chặn xóa nếu chỉ còn 1 dòng dữ liệu.

- `getRowsPayload()`:
  - duyệt tất cả dòng hiện hữu,
  - trả mảng objects `{ tenbienthe, bienthe_id, soluong, dongia, ghichu }`.

- `submitPhiếuNhap(event)`:
  - disable nút lưu,
  - gửi `POST /api/admin/nhaphang`,
  - thành công thì redirect về list kèm query message,
  - finally bật lại nút lưu.

Payload frontend gửi dạng:

```json
{
  "ghichu_phieu": "Nhap hang dot 1",
  "rows": [
    {
      "bienthe_id": "12",
      "soluong": "10",
      "dongia": "120000",
      "ghichu": "Hang moi"
    }
  ]
}
```

Frontend cũng có thể gửi dạng mảng field cũ, và backend vẫn tự chuẩn hóa về `rows`.

---

## 6) Input/Output API chính

| API | Method | Input | Output |
|---|---|---|---|
| `/api/admin/nhaphang` | GET | query `keyword` | `{ success, data: { data, tongTien, tongSoLuong } }` |
| `/api/admin/nhaphang` | POST | body `ghichu_phieu`, `rows[]` | `{ success, data: { phieunhap_id, tongtien } }` |
| `/api/admin/bienthe` | GET | query `keyword?` | `{ success, data: bienThe[] }` |

---

## 7) Nhánh lỗi và regression cần chú ý

- Không có dòng nhập hợp lệ -> `400`.
- Chọn tên biến thể nhưng không match được id -> backend sẽ lọc bỏ row không hợp lệ.
- Biến thể không tồn tại tại thời điểm lưu -> `400`.
- Lỗi DB trong transaction -> rollback toàn bộ phiếu.

Checklist test nhanh:

1. Tạo phiếu với 1 dòng.
2. Tạo phiếu với nhiều dòng biến thể.
3. Nhập sai biến thể để xác nhận lỗi validation.
4. Sau khi lưu thành công, kiểm tra tồn kho tăng đúng ở trang tồn kho.
