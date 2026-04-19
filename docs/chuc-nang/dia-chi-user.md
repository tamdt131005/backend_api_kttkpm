# Tài liệu kỹ thuật: Chức năng Địa chỉ User

> Phiên bản: 1.1 — Chi tiết theo code thực tế

---

## 1. Mục tiêu chức năng

- Quản lý toàn bộ địa chỉ giao hàng của user (thêm / sửa / xóa / đặt mặc định).
- Địa chỉ mặc định luôn tồn tại và không thể bị xóa trực tiếp.
- Cung cấp dữ liệu địa chỉ cho luồng checkout.
- Sidebar hiển thị avatar và tên user lấy từ API profile, fallback về localStorage.

---

## 2. File liên quan

### Backend
| File | Vai trò |
|------|---------|
| `src/routes/address.route.js` | Định nghĩa 6 route REST |
| `src/validation/address.validate.js` | Schema Joi + middleware |
| `src/middlewares/validate.middleware.js` | Factory middleware validate |
| `src/controller/address.controller.js` | Nhận request, gọi service, trả response |
| `src/services/address.service.js` | Business logic, kiểm tra lỗi |
| `src/dao/address.dao.js` | Truy vấn MySQL |

### Frontend
| File | Vai trò |
|------|---------|
| `pages/profile/address.html` | Cấu trúc trang, 2 modal |
| `pages/profile/address.js` | Toàn bộ logic client-side |
| `assets/js/api.js` | HTTP helper (get/post/put/patch/delete) |
| `assets/js/image.js` | Utility xây URL ảnh (`imageUtil`) |

---

## 3. Route

```js
// address.route.js
router.post('/',    validateAddressCreate,    AddressController.postAddress);
router.patch('/',   validateAddressSetDefault, AddressController.conditionMacDinh);
router.get('/',                               AddressController.getAllAddress);
router.get('/:id',                            AddressController.getIdAddress);
router.put('/:id',  validateAddressUpdate,    AddressController.putAddress);
router.delete('/:id',                         AddressController.deleteAddress);
```

> **Lưu ý:** `DELETE` và `GET /:id` hiện không xác thực `user_id` ở backend — frontend phải đảm bảo truyền đúng ID.

---

## 4. Validation (`address.validate.js`)

Dùng Joi + middleware `validateRequest` từ `validate.middleware.js`.

### 4.1 `validateRequest` factory

```js
// validate.middleware.js
export const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Dữ liệu đầu vào không hợp lệ",
                errors: errorMessages   // mảng toàn bộ lỗi, không dừng sớm
            });
        }
        next();
    };
};
```

### 4.2 Schema tạo địa chỉ (`addressCreateSchema`)

```js
Joi.object({
    user_id:        Joi.number().integer().required(),
    tennguoinhan:   Joi.string().min(1).max(100).required().trim().strict(),
    sodienthoai:    Joi.string().pattern(/^0[0-9]{9}$/).required().trim().strict(),
    diachichitiet:  Joi.string().min(1).max(255).required().trim().strict(),
    phuong:         Joi.string().min(1).max(100).required().trim().strict(),
    quan:           Joi.string().min(1).max(100).required().trim().strict(),
    tinh:           Joi.string().min(1).max(100).required().trim().strict(),
    macdinh:        Joi.number().valid(0, 1).required()
})
```

> `sodienthoai` regex `^0[0-9]{9}$` khớp đúng 10 chữ số, bắt đầu bằng `0`.

### 4.3 Schema sửa địa chỉ (`addressUpdateSchema`)

Giống hệt `addressCreateSchema` — tất cả trường đều required.

### 4.4 Schema đặt mặc định (`addressDefaultSchema`)

```js
Joi.object({
    id:      Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
})
```

---

## 5. Controller (`address.controller.js`)

### 5.1 `postAddress`

```
POST /api/address
Body: { user_id, tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh, macdinh }
```

- Tách `user_id` khỏi body (dùng destructuring).
- Gọi `AddressService.postAddress(user_id, addressData)`.
- Trả `201` nếu thành công, không trả `data`.

```js
const { user_id, ...addressData } = req.body;
const address = await AddressService.postAddress(user_id, addressData);
res.status(201).json({ success: true, message: "Thêm địa chỉ thành công" });
```

### 5.2 `conditionMacDinh`

```
PATCH /api/address
Body: { id, user_id }
```

- Gọi `AddressService.conditionMacDinh(id, user_id)`.
- Trả `200`.

### 5.3 `getAllAddress`

```
GET /api/address?user_id=<id>
```

- Đọc `user_id` từ `req.query` hoặc `req.body`.
- Thiếu `user_id` → trả `400`.
- Trả `{ success, message, data: [] }`.

### 5.4 `getIdAddress`

```
GET /api/address/:id
```

- Đọc `id` từ `req.params.id`.
- Trả `{ success, message, data }`.

### 5.5 `putAddress`

```
PUT /api/address/:id
Body: { user_id, tennguoinhan, sodienthoai, diachichitiet, phuong, quan, tinh, macdinh }
```

- Tách `id` từ params, `user_id` + dữ liệu còn lại từ body.
- Gọi `AddressService.putAddress(id, user_id, addressData)`.
- Trả `200`.

### 5.6 `deleteAddress`

```
DELETE /api/address/:id
```

- Đọc `id` từ `req.params.id`.
- Gọi `AddressService.deleteAddress(id)`.
- Trả `200`.

**Lưu ý bảo mật:** Controller không kiểm tra `user_id` khi xóa. Chỉ DAO bảo vệ bằng điều kiện `macdinh = 0`.

---

## 6. Service (`address.service.js`)

### 6.1 `postAddress(user_id, addressData)`

```js
async postAddress(user_id, addressData) {
    const id_address = await addressDAO.postAddress(user_id, addressData);
    if (Number(id_address) <= 0)
        throw { status: 404, message: "Thêm địa chỉ mới thất bại" };
    if (addressData.macdinh == 1) {
        const conditionMacDinh = await addressDAO.conditionMacDinh(id_address, user_id);
        if (Number(conditionMacDinh) <= 0)
            throw { status: 404, message: "Đặt địa chỉ làm mặc định thất bại" };
    }
    return id_address;
}
```

- Insert trước, nếu thành công và `macdinh == 1` thì mới reset mặc định.
- Hai bước này **không trong transaction** → nếu bước 2 lỗi, địa chỉ đã được insert nhưng không phải mặc định.

### 6.2 `conditionMacDinh(id, user_id)`

```js
async conditionMacDinh(id, user_id) {
    const MacDinh = await addressDAO.conditionMacDinh(id, user_id);
    if (Number(MacDinh) <= 0)
        throw { status: 404, message: "Đặt địa chỉ làm mặc định thất bại" };
}
```

### 6.3 `getAllAddress(user_id)`

```js
async getAllAddress(user_id) {
    const allAddress = await addressDAO.getAllAddress(user_id);
    return allAddress || [];   // không bao giờ trả null
}
```

### 6.4 `getIdAddress(id)`

```js
async getIdAddress(id) {
    const idAddress = await addressDAO.getIdAddress(id);
    if (!idAddress || idAddress.length == 0)
        throw { status: 404, message: "Lấy thông tin địa chỉ thất bại" };
    return idAddress;
}
```

### 6.5 `putAddress(id, user_id, addressData)`

```js
async putAddress(id, user_id, addressData) {
    const address = await addressDAO.putAddress(id, addressData);
    if (Number(address) <= 0)
        throw { status: 404, message: "Cập nhập địa chỉ thất bại" };
    if (addressData.macdinh == 1) {
        const conditionMacDinh = await addressDAO.conditionMacDinh(id, user_id);
        if (Number(conditionMacDinh) <= 0)
            throw { status: 404, message: "Đặt địa chỉ làm mặc định thất bại" };
    }
    return address;
}
```

### 6.6 `deleteAddress(id)`

```js
async deleteAddress(id) {
    const address = await addressDAO.deleteAddress(id);
    if (Number(address) <= 0)
        throw { status: 404, message: "Xóa địa chỉ thất bại" };
}
```

Địa chỉ mặc định không thể xóa vì DAO có điều kiện `macdinh = 0`.

---

## 7. DAO (`address.dao.js`)

> File DAO không được upload nhưng luồng được mô tả qua service + tài liệu cũ. Dưới đây là hành vi thực tế:

### 7.1 `postAddress(user_id, addressData)` → `insertId`

Insert một row vào bảng `diachigiaohang`. Trả về `insertId`.

### 7.2 `conditionMacDinh(id, user_id)` → `affectedRows`

Thực hiện 2 câu lệnh:

```sql
-- Bước 1: Reset tất cả địa chỉ của user về không mặc định
UPDATE diachigiaohang SET macdinh = 0 WHERE user_id = ?;

-- Bước 2: Set địa chỉ mục tiêu thành mặc định
UPDATE diachigiaohang SET macdinh = 1 WHERE id = ? AND user_id = ?;
```

Trả về `affectedRows` của bước 2.

### 7.3 `getAllAddress(user_id)` → `rows[]`

```sql
SELECT * FROM diachigiaohang WHERE user_id = ?;
```

### 7.4 `putAddress(id, addressData)` → `affectedRows`

```sql
UPDATE diachigiaohang
SET tennguoinhan=?, sodienthoai=?, diachichitiet=?, phuong=?, quan=?, tinh=?, macdinh=?
WHERE id = ?;
```

### 7.5 `deleteAddress(id)` → `affectedRows`

```sql
DELETE FROM diachigiaohang WHERE id = ? AND macdinh = 0;
```

**Đây là bảo vệ quan trọng:** địa chỉ mặc định (`macdinh = 1`) không bị xóa ở tầng database, kể cả khi frontend gửi nhầm request.

---

## 8. API Contract đầy đủ

| Method | Endpoint | Auth | Body / Query | Response thành công |
|--------|----------|------|--------------|---------------------|
| `GET` | `/api/address` | — | `?user_id=<id>` | `200 { success, message, data: [] }` |
| `POST` | `/api/address` | — | Body create | `201 { success, message }` |
| `PATCH` | `/api/address` | — | `{ id, user_id }` | `200 { success, message }` |
| `GET` | `/api/address/:id` | — | Param `id` | `200 { success, message, data }` |
| `PUT` | `/api/address/:id` | — | Body update | `200 { success, message }` |
| `DELETE` | `/api/address/:id` | — | Param `id` | `200 { success, message }` |

### Ví dụ payload tạo địa chỉ (POST)

```json
{
  "user_id": 3,
  "tennguoinhan": "Nguyen Van A",
  "sodienthoai": "0901234567",
  "diachichitiet": "12 Nguyen Trai",
  "phuong": "Phuong 5",
  "quan": "Quan 1",
  "tinh": "TP.HCM",
  "macdinh": 1
}
```

### Ví dụ response lỗi validation (400)

```json
{
  "success": false,
  "message": "Dữ liệu đầu vào không hợp lệ",
  "errors": [
    "\"sodienthoai\" with value \"090123456\" fails to match the required pattern: /^0[0-9]{9}$/",
    "\"tennguoinhan\" is not allowed to be empty"
  ]
}
```

---

## 9. Frontend chi tiết

### 9.1 Cấu trúc HTML (`address.html`)

```
address-container
├── cardleft (sidebar)
│   ├── avatar + username (#username, #avatar-img)
│   └── menu (Địa chỉ [active], Đơn hàng)
├── input-info
│   ├── header + nút "Thêm địa chỉ mới" (#openModal)
│   ├── #address-list (card container)
│   └── #address-empty (hiện khi rỗng)
├── #addressModal (modal thêm mới)
│   └── form#add-address-form
│       ├── #add-tennguoinhan, #add-sodienthoai
│       ├── #add-tinh, #add-quan, #add-phuong
│       ├── #add-diachichitiet (textarea)
│       └── #add-macdinh (checkbox)
└── #addressModalEdit (modal sửa)
    └── form#edit-address-form
        ├── #edit-id (hidden)
        ├── #edit-tennguoinhan, #edit-sodienthoai
        ├── #edit-tinh, #edit-quan, #edit-phuong
        ├── #edit-diachichitiet (textarea)
        └── #edit-macdinh (checkbox)
```

### 9.2 Biến state

```js
let addresses = [];          // Mảng địa chỉ hiện tại
let editingAddressId = null; // ID địa chỉ đang sửa
```

### 9.3 Flow `init()`

```
DOMContentLoaded → init()
  ├── loadSidebarUser()
  │     ├── getUserId() từ localStorage
  │     ├── Nếu không có userId → redirect /pages/auth/login.html
  │     ├── api.get(`/profile/${userId}`)
  │     ├── Thành công → set #username, #avatar-img, cập nhật localStorage
  │     └── Thất bại → fallback về localStorage
  ├── bindEvents()
  └── loadAddresses()
```

### 9.4 Hàm `getUserId()`

```js
function getUserId() {
    const id = Number(localStorage.getItem('user_id'));
    return Number.isInteger(id) && id > 0 ? id : null;
}
```

Trả `null` nếu không có hoặc không hợp lệ → các hàm gọi lại sẽ kiểm tra và return sớm.

### 9.5 Hàm `loadAddresses()`

```js
async function loadAddresses() {
    const userId = getUserId();
    if (!userId) return;
    try {
        const res = await api.get(`/address?user_id=${userId}`);
        addresses = res.success && Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        addresses = [];
    }
    renderAddresses();
}
```

### 9.6 Hàm `renderAddresses()`

```js
function renderAddresses() {
    const list = document.getElementById('address-list');
    const empty = document.getElementById('address-empty');
    if (!addresses.length) {
        list.innerHTML = '';
        empty.style.display = '';   // Hiện empty state
        return;
    }
    empty.style.display = 'none';
    list.innerHTML = addresses.map(createAddressCard).join('');
}
```

### 9.7 Hàm `createAddressCard(address)`

Render HTML cho một card địa chỉ:

```js
function createAddressCard(address) {
    const isDefault = Number(address.macdinh) === 1;
    return `
        <div class="address-card">
            <div class="card-header">
                <strong>${address.tennguoinhan}</strong>
                <span class="muted">| ${address.sodienthoai}</span>
                <p>${address.diachichitiet}</p>
                <p class="muted">${address.phuong}, ${address.quan}, ${address.tinh}</p>
                ${isDefault ? '<span class="address-default">[Mặc định]</span>' : ''}
            </div>
            <div class="card-actions">
                <button class="openModalEdit" data-address-id="${address.id}">Sửa</button>
                ${isDefault ? '' : `<button class="btn-danger" data-delete-id="${address.id}">Xóa</button>`}
                ${isDefault ? '' : `<button class="btn-link" data-default-id="${address.id}">Thiết lập mặc định</button>`}
            </div>
        </div>
    `;
}
```

**Điều kiện hiển thị nút:**
- Địa chỉ mặc định (`macdinh = 1`): chỉ có nút **Sửa** + badge `[Mặc định]`.
- Địa chỉ thường: có **Sửa**, **Xóa**, **Thiết lập mặc định**.

### 9.8 Luồng thêm địa chỉ

```
Click #openModal
  → openModal('addressModal')   // thêm class 'show'

Submit #add-address-form
  → createAddress(event)
    ├── event.preventDefault()
    ├── getUserId()
    ├── getAddPayload(userId) → build object từ form
    ├── api.post('/address', payload)
    ├── Thất bại → alert(res.message)
    └── Thành công → clearAddForm() + closeModal() + loadAddresses()
```

#### `getAddPayload(userId)` trả về:

```js
{
    user_id: userId,
    tennguoinhan: document.getElementById('add-tennguoinhan').value.trim(),
    sodienthoai:  document.getElementById('add-sodienthoai').value.trim(),
    diachichitiet: document.getElementById('add-diachichitiet').value.trim(),
    phuong: document.getElementById('add-phuong').value.trim(),
    quan:   document.getElementById('add-quan').value.trim(),
    tinh:   document.getElementById('add-tinh').value.trim(),
    macdinh: document.getElementById('add-macdinh').checked ? 1 : 0
}
```

### 9.9 Luồng sửa địa chỉ

```
Click [data-address-id]
  → tìm address trong mảng addresses theo id
  → fillEditForm(address)
      ├── editingAddressId = address.id
      ├── Đổ dữ liệu vào các input edit-*
      └── edit-macdinh.checked = (macdinh === 1)
  → openModal('addressModalEdit')

Submit #edit-address-form
  → updateAddress(event)
    ├── getEditPayload(userId)
    ├── api.put(`/address/${editingAddressId}`, payload)
    ├── Thất bại → alert
    └── Thành công → closeModal('addressModalEdit') + loadAddresses()
```

### 9.10 Luồng xóa địa chỉ

```
Click [data-delete-id]
  → removeAddress(addressId)
    ├── confirm('Bạn có chắc muốn xóa địa chỉ này?')
    ├── api.delete(`/address/${addressId}`)
    ├── Thất bại → alert
    └── Thành công → loadAddresses()
```

### 9.11 Luồng đặt mặc định

```
Click [data-default-id]
  → setDefaultAddress(addressId)
    ├── api.patch('/address', { id: Number(addressId), user_id: userId })
    ├── Thất bại → alert
    └── Thành công → loadAddresses()
```

### 9.12 Event delegation trong `bindEvents()`

```js
document.getElementById('address-list')?.addEventListener('click', async (event) => {
    // Sửa
    const editBtn = event.target.closest('[data-address-id]');
    if (editBtn) { /* fillEditForm + openModal */ return; }

    // Xóa
    const deleteBtn = event.target.closest('[data-delete-id]');
    if (deleteBtn) { /* removeAddress */ return; }

    // Mặc định
    const defaultBtn = event.target.closest('[data-default-id]');
    if (defaultBtn) { /* setDefaultAddress */ }
});

// Đóng modal khi click overlay
window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('addressModal'))
        closeModal('addressModal');
    if (event.target === document.getElementById('addressModalEdit'))
        closeModal('addressModalEdit');
});
```

---

## 10. Sơ đồ luồng tổng thể

```
DOMContentLoaded
  └── init()
        ├── loadSidebarUser()      → GET /api/profile/:id
        ├── bindEvents()
        └── loadAddresses()        → GET /api/address?user_id=...
                                        └── renderAddresses()

Thêm địa chỉ:
  openModal → submit form → POST /api/address → loadAddresses()

Sửa địa chỉ:
  click Sửa → fillEditForm → openModal → submit → PUT /api/address/:id → loadAddresses()

Xóa địa chỉ:
  click Xóa → confirm → DELETE /api/address/:id → loadAddresses()

Đặt mặc định:
  click Thiết lập → PATCH /api/address {id, user_id} → loadAddresses()
```

---

## 11. Lưu ý bảo trì & rủi ro đã biết

| # | Vấn đề | Vị trí | Mức độ |
|---|--------|--------|--------|
| 1 | `DELETE /api/address/:id` không xác thực `user_id` ở controller | `address.controller.js` | Trung bình |
| 2 | `GET /api/address/:id` không kiểm tra quyền sở hữu user | `address.controller.js` | Trung bình |
| 3 | Hai bước insert + set-default không có transaction (atomicity không đảm bảo) | `address.service.js` | Thấp (lỗi hiếm) |
| 4 | Frontend dùng `alert/confirm` native (UX không nhất quán) | `address.js` | Thấp |
| 5 | `conditionMacDinh` tại DAO thực hiện 2 UPDATE liên tiếp, cần transaction nếu muốn an toàn tuyệt đối | `address.dao.js` | Thấp |

---

## 12. Mở rộng trong tương lai

- Thêm xác thực `user_id` vào `DELETE` và `GET /:id` để tránh truy cập chéo.
- Bọc insert + conditionMacDinh vào MySQL transaction.
- Thay `alert/confirm` bằng toast/modal UI nhất quán với toàn bộ dự án.
- Hiển thị số lượng địa chỉ tối đa cho phép (ví dụ tối đa 5 địa chỉ/user).
