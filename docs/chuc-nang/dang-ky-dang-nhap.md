# Chức năng: Đăng ký và đăng nhập

## 1) Mục tiêu chức năng
- Cho phép user tạo tài khoản mới.
- Cho phép user đăng nhập bằng `username/password`.
- Sau đăng nhập, frontend lưu trạng thái user vào localStorage để dùng cho điều hướng và header.

## 2) File liên quan

## Backend
- `src/routes/auth.route.js`
- `src/validation/auth.validate.js`
- `src/middlewares/validate.middleware.js`
- `src/controller/auth.controller.js`
- `src/services/auth.service.js`
- `src/dao/auth.dao.js`

## Frontend
- `fontend/pages/auth/login.html`
- `fontend/pages/auth/register.html`
- `fontend/pages/auth/auth.js`
- `fontend/assets/js/api.js`

---

## 3) Luồng chạy tổng thể

1. User submit form đăng ký hoặc đăng nhập trên frontend.
2. `auth.js` gọi API qua helper `api.post(...)`.
3. Backend nhận request theo chuỗi:
   - route -> validation middleware -> controller -> service -> dao -> MySQL.
4. Backend trả JSON `success/message` (và `user` cho đăng nhập).
5. Frontend đọc response để hiển thị lỗi hoặc lưu localStorage và điều hướng trang.

---

## 4) Backend chi tiết: hàm nào gọi hàm nào

## 4.1 Route

Trong `auth.route.js`:

```js
router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);
```

Ý nghĩa:
- Mọi request auth phải qua validate trước khi vào controller.

## 4.2 Validation

Trong `auth.validate.js` có 2 schema:

```js
const signupSchema = Joi.object({
  username: Joi.string().required().min(3).max(50).trim().strict(),
  password: Joi.string().required().min(6).max(50).trim().strict(),
  fullname: Joi.string().optional().allow('').min(3).max(100).trim().strict(),
  email: Joi.string().email().required().min(3).max(100).trim().strict()
});

const signinSchema = Joi.object({
  username: Joi.string().required().min(3).max(50).trim().strict(),
  password: Joi.string().required().min(6).max(50).trim().strict()
});
```

`validateRequest` trong `validate.middleware.js` sẽ:
- trả `400` nếu body sai schema,
- hoặc `next()` nếu hợp lệ.

## 4.3 Controller

Controller `signup`:

```js
export const signup = async (req, res) => {
  const { username, password, fullname, email } = req.body;
  await authService.signup(username, password, fullname, email);
  return res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
};
```

Controller `signin`:

```js
export const signin = async (req, res) => {
  const { username, password } = req.body;
  const user = await authService.signin(username, password);
  return res.status(200).json({ success: true, message: 'Đăng nhập thành công!', user });
};
```

Ý nghĩa:
- Controller giữ mỏng: đọc request, gọi service, trả response.

## 4.4 Service

Service `signup` trong `auth.service.js`:

```js
async signup(username, password, fullname, email) {
  const existingUser = await authDao.getUserByUsername(username);
  if (existingUser) throw { status: 409, message: 'Tên đăng nhập đã tồn tại!' };

  const existingEmail = await authDao.getUserByEmail(email);
  if (existingEmail) throw { status: 409, message: 'Email này đã được sử dụng!' };

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await authDao.createUser(username, hashedPassword, fullname || username, email);
}
```

Service `signin`:

```js
async signin(username, password) {
  const user = await authDao.getUserByUsername(username);
  if (!user) throw { status: 404, message: 'Tài khoản không tồn tại!' };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 400, message: 'Sai mật khẩu!' };

  return {
    id: user.id || user.user_id,
    username: user.username,
    fullname: user.fullname,
    role: user.role,
    avatar: user.avatar
  };
}
```

Ý nghĩa:
- Service chứa toàn bộ business auth: check trùng, hash password, compare password, chuẩn hóa dữ liệu user trả ra.

## 4.5 DAO

Trong `auth.dao.js`:

```js
async createUser(username, password, fullname, email) {
  return pool.execute(
    'INSERT INTO users (username, password, fullname, email, role) VALUES (?, ?, ?, ?, ?)',
    [username, password, fullname, email, 'user']
  );
}

async getUserByUsername(username) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
  return rows.length > 0 ? rows[0] : null;
}

async getUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows.length > 0 ? rows[0] : null;
}
```

DAO chỉ phụ trách truy vấn DB.

---

## 5) Contract API

| API | Method | Input | Output |
|---|---|---|---|
| `/api/auth/signup` | POST | `username, password, email, fullname?` | `{ success, message }` |
| `/api/auth/signin` | POST | `username, password` | `{ success, message, user }` |

Ví dụ request đăng ký:

```json
{
  "username": "user_demo",
  "password": "123456",
  "email": "demo@gmail.com",
  "fullname": "Demo User"
}
```

Ví dụ response đăng nhập thành công:

```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "user": {
    "id": 3,
    "username": "user_demo",
    "fullname": "Demo User",
    "role": "user",
    "avatar": "user.webp"
  }
}
```

---

## 6) Frontend chi tiết: HTML + JS

## 6.1 `login.html`

Các thành phần chính:
- Form `#loginForm`.
- Input `#username`, `#password`.
- Box lỗi `#login-error`, text `#login-error-text`.
- Nạp script `api.js` và `auth.js`.

## 6.2 `register.html`

Các thành phần chính:
- Form `#registerForm`.
- Input `#username`, `#email`, `#password`, `#confirm_password`.
- Box lỗi `#register-error`.
- Box thành công `#register-success`.

## 6.3 `auth.js`

File này dùng một listener chung:

```js
document.addEventListener('DOMContentLoaded', () => {
  // có loginForm thì gắn handler login
  // có registerForm thì gắn handler register
});
```

Lý do:
- 1 file JS dùng cho cả trang login và register.

### A) Luồng đăng nhập

1. Bắt submit `#loginForm`, `preventDefault()`.
2. Lấy `username/password`.
3. Gọi:

```js
const data = await api.post('/auth/signin', { username, password });
```

4. Nếu `data.success`:
- lưu localStorage:
  - `isLoggedIn`, `user_id`, `username`, `fullname`, `avatar`, `role`.
- điều hướng:
  - `admin` -> `../../pages/admin/index.html`
  - `user` -> `../../index.html`

5. Nếu lỗi: hiển thị message lên `#login-error-text`.

### B) Luồng đăng ký

1. Bắt submit `#registerForm`.
2. Kiểm tra client-side `password === confirm_password`.
3. Gọi:

```js
const data = await api.post('/auth/signup', { username, password, email });
```

4. Nếu thành công:
- ẩn lỗi,
- hiện box thành công,
- delay 2 giây rồi chuyển sang `login.html`.

5. Nếu lỗi: hiển thị message lỗi từ backend.

---

## 7) Sơ đồ gọi hàm rút gọn

```text
Submit form login/register
  -> auth.js handler
    -> api.post('/auth/...')
      -> backend route -> validate -> controller -> service -> dao -> MySQL
    -> nhận response
      -> lưu localStorage + redirect (thành công)
      -> hoặc hiển thị lỗi (thất bại)
```

---

## 8) Lưu ý bảo trì
1. Hệ thống hiện chưa dùng JWT cho frontend user flow, đang dựa vào localStorage.
2. Nếu chuyển sang auth token/session chuẩn, cần cập nhật đồng bộ `auth.js`, `api.js`, và header component.
3. Khi đổi message lỗi ở service, nên giữ format response `{ success, message }` để frontend không phải đổi nhiều.