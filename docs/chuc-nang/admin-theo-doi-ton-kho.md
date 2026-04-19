# Chức năng: Theo dõi tồn kho admin

## 1) Mục tiêu chức năng
- Theo dõi tồn kho theo từng sản phẩm.
- Lọc danh sách theo từ khóa, trạng thái tồn và hướng sắp xếp.
- Hiển thị thống kê số lượng sản phẩm theo nhóm tồn kho.

## 2) File liên quan

## Backend
- `src/routes/admin.route.js`
- `src/controller/admin/admin.stock.controller.js`
- `src/services/admin/admin.stock.service.js`
- `src/dao/admin/admin.stock.dao.js`

## Frontend
- `fontend/pages/admin/tonkho_list.html`
- `fontend/pages/admin/js/admin.common.js`
- `fontend/pages/admin/js/tonkho_list.js`
- `fontend/assets/js/api.js`

---

## 3) Luồng tổng thể theo chain hàm

1. Mở `tonkho_list.html`.
2. `tonkho_list.js` chạy `init()`:
  - `bindForm()`
  - `fillFormFromQuery()`
  - `loadTonKho()`.
3. `loadTonKho()` đọc query và gọi `GET /api/admin/tonkho?...`.
4. Backend xử lý route -> controller -> service -> dao -> MySQL.
5. Frontend render bảng tồn kho và khối thống kê.

---

## 4) Backend chi tiết

## 4.1 Route

```js
router.get('/tonkho', adminController.getTonKho);
router.get('/bienthe', adminController.getBienThe);
```

## 4.2 Controller chi tiết từng hàm

Trong `admin.stock.controller.js`:

- `getTonKho(req, res)`:
  - đọc query:
    - `keyword` mặc định rỗng,
    - `order` mặc định `asc`,
    - `status` mặc định rỗng,
  - gọi `adminStockService.layTonKho(keyword, order, status)`.

- `getBienThe(req, res)`:
  - đọc `keyword`,
  - gọi `layDanhSachBienThe(keyword)`.

Lỗi đều theo pattern:

- `error.status || 500`
- trả `{ success: false, message }`.

## 4.3 Service `admin.stock.service.js`

- `layTonKho(keyword, order, status)`:
  - gọi `adminStockDAO.layTonKho(keyword, order, status)` để lấy danh sách.
  - gọi `adminStockDAO.layThongKeTonKho()` để lấy số liệu tổng.
  - return `{ danhsach, thongke }`.

- `layDanhSachBienThe(keyword)`:
  - phục vụ module nhập hàng để chọn biến thể.

## 4.4 DAO `admin.stock.dao.js` và SQL chi tiết

- `layTonKho(keyword, order, status)`:
  - chuẩn hóa hướng sắp xếp:
    - nếu `order=desc` thì `ORDER BY tonkho DESC`,
    - còn lại mặc định `ASC`.
  - query:
    - join `sanpham` với `bienthesp`, `danhmuc`.
    - group theo sản phẩm để lấy tổng tồn kho.
  - lọc theo trạng thái bằng `HAVING`:
    - `hethang`: `tonkho <= 0`
    - `saphet`: `tonkho > 0 AND tonkho < 20`
    - `conhang`: `tonkho >= 20`
  - luôn lọc sản phẩm chưa xóa mềm (`deleted_at IS NULL`).

- `layThongKeTonKho()`:
  - query con tổng hợp tồn theo từng sản phẩm,
  - query ngoài đếm theo 3 nhóm:
    - hết hàng,
    - sắp hết,
    - còn hàng,
    - tổng.

- `layDanhSachBienThe(keyword)`:
  - join biến thể với sản phẩm,
  - tạo field hiển thị `tenbienthe` để autocomplete bên trang nhập hàng.

---

## 5) Frontend chi tiết

Trong `tonkho_list.js`:

- `getTrangThaiTonKho(tonkho)`:
  - ép tồn kho về số,
  - `<= 0`: `Hết hàng`,
  - `< 20`: `Sắp hết`,
  - còn lại: `Còn hàng`.

- `renderTable(rows)`:
  - nếu rỗng -> render dòng trống.
  - nếu có -> map từng sản phẩm:
    - STT,
    - tên,
    - danh mục,
    - tồn kho,
    - trạng thái text từ `getTrangThaiTonKho`.

- `renderStats(thongke)`:
  - đổ số vào:
    - `stats-total`,
    - `stats-hethang`,
    - `stats-saphet`,
    - `stats-conhang`.

- `bindForm()`:
  - bắt submit form filter,
  - lấy 3 field `keyword`, `order`, `status`,
  - gọi `setQuery(...)` để reload theo URL mới.

- `fillFormFromQuery()`:
  - khi vào trang, đồng bộ UI filter với query hiện tại.

- `loadTonKho()`:
  - build query params,
  - gọi `adminApi.get('/tonkho?...')`,
  - render table + stats.

- `init()`:
  - bind form,
  - fill form,
  - load dữ liệu.

---

## 6) Input/Output API chính

| API | Method | Input | Output |
|---|---|---|---|
| `/api/admin/tonkho` | GET | query `keyword`, `order`, `status` | `{ success, data: { danhsach, thongke } }` |
| `/api/admin/bienthe` | GET | query `keyword?` | `{ success, data: bienThe[] }` |

---

## 7) Nhánh lỗi và regression cần chú ý

- `order` không hợp lệ vẫn fallback về `asc`.
- `status` không hợp lệ thì không lọc theo trạng thái.
- Nếu API lỗi, frontend render bảng rỗng và stats = 0.

Checklist test nhanh:

1. Lọc theo keyword tên sản phẩm.
2. Đổi sort `asc` và `desc`.
3. Lọc lần lượt `hethang`, `saphet`, `conhang`.
4. Đối chiếu số liệu stats có khớp tổng số dòng theo từng trạng thái.
