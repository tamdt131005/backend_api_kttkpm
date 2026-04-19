# Tài liệu kỹ thuật: Chức năng Profile User

> Phiên bản: 1.1 — Chi tiết theo code thực tế

---

## 1. Mục tiêu chức năng

- Hiển thị thông tin hồ sơ cá nhân: username, họ tên, email, số điện thoại, giới tính, ngày sinh, avatar.
- Cho phép user cập nhật tất cả trường trừ `username`.
- Upload avatar mới (multipart/form-data, xử lý bởi multer).
- Đồng bộ `fullname` và `avatar` vào localStorage ngay sau khi lưu để header/sidebar cập nhật tức thì mà không cần reload trang.

---

## 2. File liên quan

### Backend

| File | Vai trò |
|------|---------|
| `src/routes/profile.route.js` | 3 route + cấu hình multer |
| `src/validation/profile.validate.js` | Schema Joi cho PUT |
| `src/middlewares/validate.middleware.js` | Factory middleware validate |
| `src/controller/profile.controller.js` | Nhận request, gọi service, trả response |
| `src/services/profile.service.js` | Business logic |
| `src/dao/profile.dao.js` | Truy vấn MySQL bảng `users` |

### Frontend

| File | Vai trò |
|------|---------|
| `pages/profile/profile.html` | Form profile + sidebar |
| `pages/profile/profile.js` | Toàn bộ logic client-side |
| `assets/js/api.js` | HTTP helper (bao gồm `api.upload` cho multipart) |
| `assets/js/image.js` | `imageUtil.avatar()` để build URL ảnh |

---

## 3. Route (`profile.route.js`)

```js
router.post('/avatar', upload.single('avatar'), ProfileController.uploadAvatar);
router.get('/:id',                              ProfileController.getProfile);
router.put('/',        validateProfile,          ProfileController.putProfile);
```

### Cấu hình multer (trong route file):

```js
// Thư mục lưu ảnh
dest: 'src/upload/img/avatar'

// Giới hạn kích thước
limits: { fileSize: 2 * 1024 * 1024 }   // 2MB

// Chỉ nhận image/*
fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ nhận file ảnh'));
}

// Tên file: avatar_<Date.now()>.<ext>
filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
}
```

> **Lưu ý:** Route `POST /avatar` không có middleware xác thực user, chỉ dựa vào `user_id` do client tự gửi.

---

## 4. Validation (`profile.validate.js`)

```js
const profile = Joi.object({
    id:        Joi.number().integer().required(),
    email:     Joi.string().email().min(3).max(100).required().trim().strict(),
    fullname:  Joi.string().min(3).max(50).trim().allow(null),
    phone:     Joi.string().pattern(/^0[0-9]{9}$/).trim().allow(null),
    sex:       Joi.string().valid('Nam', 'Nữ').trim().allow(null),
    ngaysinh:  Joi.date().iso().allow(null),
    avatar:    Joi.string().min(1).max(255).trim().allow(null),
});

export const validateProfile = validateRequest(profile);
```

**Điểm đặc biệt:**
- `email` là trường bắt buộc duy nhất (ngoài `id`).
- `fullname`, `phone`, `sex`, `ngaysinh`, `avatar` đều `allow(null)` → user có thể bỏ trống.
- `phone` regex `^0[0-9]{9}$` — chỉ số VN 10 chữ số.
- `ngaysinh` phải ở format ISO 8601 (`YYYY-MM-DD` hoặc `YYYY-MM-DDTHH:mm:ssZ`).

---

## 5. Controller (`profile.controller.js`)

### 5.1 `uploadAvatar(req, res)`

```js
async uploadAvatar(req, res) {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Thiếu file avatar" });
    }
    res.status(201).json({
        success: true,
        message: "Upload avatar thành công",
        data: { avatar: `avatar/${req.file.filename}` }
    });
}
```

- Trả đường dẫn tương đối `avatar/<filename>`.
- Multer đã xử lý lưu file trước khi vào hàm này.

### 5.2 `getProfile(req, res)`

```js
async getProfile(req, res) {
    const id = req.params.id;
    const profile = await profileService.getProfile(id);
    res.status(200).json({ success: true, message: "Lấy thông tin thành công", data: profile });
}
```

- `id` lấy từ `req.params.id` (string), service/DAO tự convert.
- Catch lỗi trả `500` cố định (không map `error.status`).

### 5.3 `putProfile(req, res)`

```js
async putProfile(req, res) {
    const { id, ...profileData } = req.body;
    const profile = await profileService.putProfile(id, profileData);
    res.status(201).json({ success: true, message: "Cập nhật hồ sơ thành công" });
}
```

- Tách `id` khỏi body bằng destructuring.
- Catch lỗi trả `500` cố định — **đây là bug đã biết**, service có thể throw `404` nhưng client sẽ thấy `500`.

---

## 6. Service (`profile.service.js`)

### 6.1 `getProfile(id)`

```js
async getProfile(id) {
    const profile = await profileDao.getProfile(id);
    if (!profile)
        throw { status: 404, message: "Lấy thông tin thất bại" };
    return profile;
}
```

### 6.2 `putProfile(id, profileData)`

```js
async putProfile(id, profileData) {
    const profile = await profileDao.putProfile(id, profileData);
    if (Number(profile) <= 0)
        throw { status: 404, message: "Cập nhập thông tin thất bại" };
}
```

- `profile` ở đây là `affectedRows` từ DAO.
- Nếu `affectedRows = 0` (không tìm thấy user) → throw `404`. Nhưng do controller bắt lỗi trả `500`, client không phân biệt được.

---

## 7. DAO (`profile.dao.js`)

```js
class ProfileDao {
    async getProfile(id) {
        const [rows] = await pool.execute(
            'SELECT username, email, fullname, phone, sex, ngaysinh, avatar FROM users WHERE id = ?',
            [id]
        );
        return rows[0];   // undefined nếu không tìm thấy
    }

    async putProfile(id, profileData) {
        const { email, fullname, phone, sex, ngaysinh, avatar } = profileData;
        const [row] = await pool.execute(
            'UPDATE users SET email=?, fullname=?, phone=?, sex=?, ngaysinh=?, avatar=? WHERE id=?',
            [email, fullname, phone, sex, ngaysinh, avatar, id]
        );
        return row.affectedRows;
    }
}
```

**Cột được SELECT:**
- `username`, `email`, `fullname`, `phone`, `sex`, `ngaysinh`, `avatar`
- **Không SELECT** `password`, `role`, `created_at` → bảo mật tốt.

**Cột được UPDATE:**
- 6 cột: `email`, `fullname`, `phone`, `sex`, `ngaysinh`, `avatar`.
- `username` không bao giờ bị sửa.

---

## 8. API Contract đầy đủ

| Method | Endpoint | Body / Param | Response thành công |
|--------|----------|--------------|---------------------|
| `GET` | `/api/profile/:id` | Param `id` | `200 { success, message, data: { username, email, fullname, phone, sex, ngaysinh, avatar } }` |
| `PUT` | `/api/profile` | Body JSON (xem bên dưới) | `201 { success, message }` |
| `POST` | `/api/profile/avatar` | form-data, key `avatar` | `201 { success, message, data: { avatar: "avatar/avatar_xxx.jpg" } }` |

### Payload PUT `/api/profile`

```json
{
  "id": 3,
  "email": "user@gmail.com",
  "fullname": "Nguyen Van A",
  "phone": "0901234567",
  "sex": "Nam",
  "ngaysinh": "2001-10-05",
  "avatar": "avatar/avatar_1710000000000.jpg"
}
```

### Response lỗi validation (400)

```json
{
  "success": false,
  "message": "Dữ liệu đầu vào không hợp lệ",
  "errors": [
    "\"email\" must be a valid email",
    "\"phone\" with value \"012345\" fails to match the required pattern: /^0[0-9]{9}$/"
  ]
}
```

### Response data GET profile

```json
{
  "success": true,
  "message": "Lấy thông tin thành công",
  "data": {
    "username": "nguyenvana",
    "email": "user@gmail.com",
    "fullname": "Nguyen Van A",
    "phone": "0901234567",
    "sex": "Nam",
    "ngaysinh": "2001-10-05T00:00:00.000Z",
    "avatar": "avatar/avatar_1710000000000.jpg"
  }
}
```

---

## 9. Frontend chi tiết

### 9.1 Cấu trúc HTML (`profile.html`)

```
profile-container
├── cardleft (sidebar)
│   ├── #avatar-img + #username
│   └── menu (Địa chỉ, Đơn hàng)
└── input-info
    ├── header + mô tả trang
    ├── #profile-alert (ẩn mặc định, hiện khi có thông báo)
    └── form#profile-form
        ├── input-info-body
        │   ├── #username-value (span, read-only)
        │   ├── #name (input text — fullname)
        │   ├── #email (input email)
        │   ├── #phone (input text)
        │   ├── radio [sex-nam / sex-nu]
        │   ├── #ngaysinh (input date)
        │   └── #btn-save-profile (submit button)
        └── input-info-sidebar
            ├── #avatarPreview (img)
            ├── #avatarInput (file input, display:none)
            └── #avatarButton (trigger click avatarInput)
```

### 9.2 Biến state

```js
let profile = {};   // Object profile hiện tại, merge sau mỗi lần update thành công
```

### 9.3 Flow khởi tạo

```
DOMContentLoaded
  └── hienThiManHinh()
        ├── bindAvatarInput()         // Gắn event chọn file ảnh
        ├── #profile-form.addEventListener('submit', updateProfile)
        └── getUser()
              ├── getUserId() từ localStorage
              ├── Không có userId → redirect /pages/auth/login.html
              ├── api.get(`/profile/${userId}`)
              ├── Thành công → profile = res.data → renderProfile()
              └── Thất bại → setAlert('error', ...)
```

### 9.4 Hàm `getUserId()`

```js
function getUserId() {
    const id = Number(localStorage.getItem('user_id'));
    return Number.isInteger(id) && id > 0 ? id : null;
}
```

### 9.5 Hàm `renderProfile()`

Đổ dữ liệu từ biến `profile` lên toàn bộ giao diện:

```js
function renderProfile() {
    // Sidebar
    document.getElementById('username').textContent   = profile.fullname || 'Người dùng';
    document.getElementById('avatar-img').src         = imageUtil.avatar(profile.avatar || '');

    // Avatar preview
    document.getElementById('avatarPreview').src      = imageUtil.avatar(profile.avatar || '');

    // Form fields
    document.getElementById('username-value').textContent = profile.username || '';
    document.getElementById('name').value             = profile.fullname || '';
    document.getElementById('email').value            = profile.email || '';
    document.getElementById('phone').value            = profile.phone || '';
    document.getElementById('sex-nam').checked        = profile.sex === 'Nam';
    document.getElementById('sex-nu').checked         = profile.sex === 'Nữ';
    document.getElementById('ngaysinh').value         = toDateInput(profile.ngaysinh);
}
```

### 9.6 Hàm `toDateInput(value)`

Chuyển ngày sinh từ DB (ISO string) sang format `YYYY-MM-DD` cho `<input type="date">`:

```js
function toDateInput(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    // Đã đúng format → trả thẳng
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    // Parse từ ISO string
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
```

> DB trả `"2001-10-05T00:00:00.000Z"` → `toDateInput` chuyển thành `"2001-10-05"` để input hiển thị đúng.

### 9.7 Hàm `bindAvatarInput()`

```js
function bindAvatarInput() {
    const avatarButton = document.getElementById('avatarButton');
    const avatarInput  = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');

    // Click nút "Chọn ảnh" → trigger input file
    avatarButton.addEventListener('click', (e) => {
        e.preventDefault();
        avatarInput.click();
    });

    // Khi user chọn file → preview bằng FileReader
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            avatarPreview.src = event.target?.result || avatarPreview.src;
        };
        reader.readAsDataURL(file);
    });
}
```

Preview avatar hiển thị ngay lập tức qua `FileReader.readAsDataURL` mà không cần upload.

### 9.8 Hàm `uploadAvatarIfNeeded()`

```js
async function uploadAvatarIfNeeded() {
    const file = document.getElementById('avatarInput')?.files?.[0];
    if (!file) return profile.avatar || null;   // Giữ nguyên avatar cũ

    const formData = new FormData();
    formData.append('avatar', file);

    const uploadRes = await api.upload('/profile/avatar', formData);
    if (!uploadRes.success || !uploadRes.data?.avatar) {
        throw new Error(uploadRes.message || 'Upload avatar thất bại');
    }
    return uploadRes.data.avatar;   // "avatar/avatar_xxx.jpg"
}
```

### 9.9 Hàm `buildUpdatePayload(userId)`

```js
function buildUpdatePayload(userId) {
    return {
        id:       userId,
        email:    document.getElementById('email')?.value.trim() || '',
        fullname: document.getElementById('name')?.value.trim() || null,
        phone:    document.getElementById('phone')?.value.trim() || null,
        sex:      getSexValue(),                                     // null nếu chưa chọn
        ngaysinh: document.getElementById('ngaysinh')?.value || null,
        avatar:   profile.avatar || null     // sẽ bị ghi đè bởi uploadAvatarIfNeeded
    };
}

function getSexValue() {
    const checked = document.querySelector('input[name="sex"]:checked');
    return checked ? checked.value : null;
}
```

### 9.10 Hàm `updateProfile(event)` — flow chi tiết

```
submit#profile-form
  └── updateProfile(event)
        ├── event.preventDefault()
        ├── clearAlert()
        ├── getUserId() → redirect nếu không có
        ├── Disable #btn-save-profile, đổi text thành "Đang lưu..."
        ├── buildUpdatePayload(userId)           → tạo object payload
        ├── uploadAvatarIfNeeded()               → upload ảnh nếu có file mới
        │     ├── Không có file → trả profile.avatar (giữ nguyên)
        │     └── Có file       → api.upload('/profile/avatar', formData)
        │                           → nhận lại "avatar/avatar_xxx.jpg"
        ├── payload.avatar = kết quả từ bước trên
        ├── api.put('/profile', payload)
        ├── Thất bại → setAlert('error', res.message)
        └── Thành công:
              ├── profile = { ...profile, ...payload }  (merge state)
              ├── localStorage.setItem('fullname', profile.fullname)
              ├── localStorage.setItem('avatar', profile.avatar)  (nếu có)
              ├── Reset avatarInput.value = ''           (xóa file đã chọn)
              ├── renderProfile()                        (cập nhật UI)
              └── setAlert('success', 'Cập nhật hồ sơ thành công')
```

### 9.11 Hàm `setAlert(type, message)` / `clearAlert()`

```js
function setAlert(type, message) {
    const alertBox = document.getElementById('profile-alert');
    const isSuccess = type === 'success';
    alertBox.className = `alert ${isSuccess ? 'alert-success' : 'alert-error'}`;
    alertBox.innerHTML = `<i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> ${message}`;
    alertBox.style.display = '';
}

function clearAlert() {
    const alertBox = document.getElementById('profile-alert');
    alertBox.style.display = 'none';
    alertBox.className = '';
    alertBox.innerHTML = '';
}
```

Dùng class CSS `alert-success` / `alert-error` để phân biệt màu sắc.

---

## 10. Sơ đồ luồng tổng thể

```
DOMContentLoaded
  └── hienThiManHinh()
        ├── bindAvatarInput()
        ├── form.addEventListener('submit', updateProfile)
        └── getUser()
              └── GET /api/profile/:id
                    └── renderProfile()

Chọn ảnh:
  #avatarButton click → #avatarInput.click() → FileReader → preview

Submit form:
  updateProfile()
    ├── [Nếu có file] POST /api/profile/avatar → nhận avatar path
    └── PUT /api/profile {id, email, fullname, phone, sex, ngaysinh, avatar}
          ├── validate.middleware → Joi validation
          ├── profile.controller.putProfile
          ├── profile.service.putProfile
          └── profile.dao.putProfile → UPDATE users SET ...
```

---

## 11. localStorage mapping

| Key | Giá trị | Cập nhật khi |
|-----|---------|--------------|
| `user_id` | ID user (number dạng string) | Login |
| `fullname` | Họ tên đầy đủ | Login + sau mỗi lần lưu profile |
| `avatar` | Path avatar tương đối | Login + sau mỗi lần lưu profile |

Khi `renderProfile()` chạy, sidebar dùng `profile.fullname` từ state (không đọc lại localStorage) để hiển thị tức thì.

---

## 12. Lưu ý bảo trì & rủi ro đã biết

| # | Vấn đề | Vị trí | Mức độ |
|---|--------|--------|--------|
| 1 | `profile.controller.js` catch trả `500` cố định, không map `error.status` từ service | `profile.controller.js` | Trung bình |
| 2 | Route `POST /avatar` không có middleware xác thực user | `profile.route.js` | Trung bình |
| 3 | `GET /api/profile/:id` không kiểm tra quyền: bất kỳ ai biết `id` cũng lấy được thông tin | `profile.controller.js` | Trung bình |
| 4 | Frontend gửi `email: ''` (chuỗi rỗng) nếu user xóa email — Joi sẽ reject vì `min(3)` | `profile.js` `buildUpdatePayload` | Thấp |
| 5 | `profile = { ...profile, ...payload }` merge cả `avatar: null` nếu không upload ảnh mới → có thể xóa avatar ngoài ý muốn nếu `uploadAvatarIfNeeded` trả `null` | `profile.js` | Thấp |

---

## 13. Mở rộng trong tương lai

- Thêm middleware JWT/session để xác thực `id` trong GET và PUT profile.
- Fix controller để map `error.status` từ service (404 vs 500).
- Giới hạn số lần upload avatar trong 1 phiên để tránh spam file.
- Thêm crop ảnh phía client trước khi upload (dùng `canvas` API hoặc thư viện `cropperjs`).
- Validate `email` uniqueness ở service trước khi UPDATE (hiện tại DB constraint tự xử lý, nhưng lỗi sẽ là 500 generic).
