---
name: nodejs-layered-arch
description: Hỗ trợ phát triển và sinh code cho hệ thống Node.js/Express.js theo kiến trúc phân layer: route → middleware → validation → controller → service → dao, cùng thư mục frontend. Dùng skill này bất cứ khi nào người dùng đề cập đến việc tạo route, API, controller, service, DAO, validation, middleware trong một dự án Node.js có phân layer — kể cả khi họ chỉ nói "thêm tính năng X", "tạo CRUD cho Y", "sửa API Z", hoặc nhắc đến các layer cụ thể.
---

# Node.js Layered Architecture Skill

Skill này giúp sinh code và cấu trúc file cho dự án Node.js/Express.js theo kiến trúc phân layer chuẩn.

## Điều kiện tiên quyết bắt buộc

- Trước khi triển khai, phải tạo file kế hoạch tạm tại `.github/PLAN_REVIEW_TEMP.md` để người dùng duyệt trước.
- File kế hoạch tạm phải ghi rõ: mục tiêu, danh sách file dự kiến sửa, danh sách file dự kiến xóa/đổi tên/di chuyển (nếu có), danh sách thay đổi dữ liệu quan trọng (nếu có), rủi ro và tác động.
- Không được xóa, đổi tên, di chuyển file sẵn có nếu chưa có chấp thuận rõ ràng từ người dùng.
- Không được tinh chỉnh dữ liệu quan trọng (schema, migration, seed, dữ liệu nghiệp vụ chính, config nhạy cảm) nếu chưa có chấp thuận rõ ràng từ người dùng.
- Nếu phát sinh hạng mục mới ngoài kế hoạch đã duyệt, phải cập nhật lại file kế hoạch tạm và xin chấp thuận bổ sung trước khi tiếp tục.

## Cấu trúc dự án chuẩn

```
project/
├── routes/          # Định nghĩa route, gắn middleware/validation/controller
├── middlewares/     # Xác thực token, phân quyền, xử lý lỗi chung
├── validations/     # Validate input đầu vào
├── controllers/     # Nhận request, gọi service, trả response
├── services/        # Business logic
├── dao/             # Truy vấn database trực tiếp
└── frontend/        # Giao diện người dùng
```

## Luồng xử lý

| Trường hợp | Luồng |
|---|---|
| Đầy đủ | `route → middleware → validation → controller → service → dao` |
| Không cần auth | `route → validation → controller → service → dao` |
| Không cần validate | `route → middleware → controller → service → dao` |
| Đơn giản nhất | `route → controller → service → dao` |

## Quy trình khi nhận yêu cầu

### Bước 1 — Thu thập thông tin
Trước khi viết code, hỏi (nếu chưa rõ):
- Tên feature / tên bảng DB liên quan?
- Các trường dữ liệu chính?
- Có cần middleware (JWT auth, phân quyền role) không?
- Có cần validate input không? Dùng thư viện gì (Joi, Zod, express-validator)?
- Dự án dùng CommonJS hay ES Modules?
- ORM/query builder đang dùng (raw mysql2, Sequelize, Knex...)?

### Bước 2 — Tạo kế hoạch tạm để duyệt
- Tạo hoặc cập nhật `.github/PLAN_REVIEW_TEMP.md`.
- Liệt kê đầy đủ các hạng mục thay đổi và đánh dấu mục nào cần chấp thuận rõ ràng.
- Chỉ tiếp tục khi người dùng đã duyệt.

### Bước 3 — Xác định layer cần tạo/sửa
Không tạo layer thừa. Chỉ tạo đúng những gì cần thiết.

### Bước 4 — Sinh code theo thứ tự
`route → validation (nếu cần) → controller → service → dao`

---

## Quy tắc từng layer

### routes/
```js
// ten-feature.route.js
import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createSchema } from '../validations/ten-feature.validation.js';
import * as controller from '../controllers/ten-feature.controller.js';

const router = express.Router();

// Có đầy đủ middleware + validation
router.post('/', verifyToken, validateBody(createSchema), controller.create);

// Không cần middleware
router.get('/:id', controller.getById);

export default router;
```

### middlewares/
```js
// Chỉ xử lý: auth, role, logging, error handler
// KHÔNG chứa business logic
export const verifyToken = (req, res, next) => { ... };
export const requireRole = (role) => (req, res, next) => { ... };
```

### validations/
```js
// ten-feature.validation.js — chỉ validate hình thức dữ liệu
import Joi from 'joi';

export const createSchema = Joi.object({
  ten: Joi.string().min(2).max(100).required(),
  gia: Joi.number().positive().required(),
});
```

### controllers/
```js
// ten-feature.controller.js
import * as service from '../services/ten-feature.service.js';

export const create = async (req, res) => {
  try {
    const data = await service.create(req.body);
    res.json({ success: true, message: 'Tạo thành công', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

> **Quy tắc cứng:** Controller KHÔNG truy vấn DB, KHÔNG chứa business logic.

### services/
```js
// ten-feature.service.js
import * as dao from '../dao/ten-feature.dao.js';

export const create = async (body) => {
  // Validate nghiệp vụ (kiểm tra trùng, tính toán...)
  const existing = await dao.findByName(body.ten);
  if (existing) throw new Error('Tên đã tồn tại');
  return dao.insert(body);
};
```

> **Quy tắc cứng:** Service KHÔNG biết gì về `req` / `res`.

### dao/
```js
// ten-feature.dao.js
import db from '../config/db.js';

export const insert = async (data) => {
  const [result] = await db.query(
    'INSERT INTO ten_bang (ten, gia) VALUES (?, ?)',
    [data.ten, data.gia]
  );
  return result;
};

export const findByName = async (ten) => {
  const [rows] = await db.query(
    'SELECT * FROM ten_bang WHERE ten = ? LIMIT 1',
    [ten]
  );
  return rows[0] || null;
};
```

> **Quy tắc cứng:** DAO chỉ chứa query, không chứa logic.

---

## Convention đặt tên file

| Layer | Tên file |
|---|---|
| Route | `ten-feature.route.js` |
| Validation | `ten-feature.validation.js` |
| Controller | `ten-feature.controller.js` |
| Service | `ten-feature.service.js` |
| DAO | `ten-feature.dao.js` |

## Response format chuẩn

```js
// Thành công
res.json({ success: true, message: 'Mô tả', data: ... });

// Lỗi client
res.status(400).json({ success: false, message: 'Lý do lỗi' });

// Lỗi server
res.status(500).json({ success: false, message: err.message });
```

## Frontend (thư mục frontend/)

- Hỏi framework đang dùng trước khi viết code (Vanilla JS, React, Vue...)
- Gọi API theo đúng endpoint đã định nghĩa ở backend
- Xử lý response theo format `{ success, message, data }`
