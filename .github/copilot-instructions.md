# Project Guidelines

## Build and Test
- Install dependencies: `npm install`
- Run API in development: `npm run dev`
- Run API in production mode: `npm start`
- `npm test` is currently a placeholder and exits with code 1.
- Use Bruno requests in [../btapweb](../btapweb) for endpoint checks until an automated test suite exists.

## Architecture
- API entrypoint is [../index.js](../index.js), which mounts route groups under `/api/*`.
- Backend flow is: routes -> controllers -> services -> DAOs -> MySQL pool.
- Database config and pool live in [../src/config/config.json](../src/config/config.json) and [../src/config/db.js](../src/config/db.js).
- Admin functionality is split by domain in [../src/controller/admin](../src/controller/admin), [../src/services/admin](../src/services/admin), and [../src/dao/admin](../src/dao/admin), then composed in [../src/controller/admin.controller.js](../src/controller/admin.controller.js).
- Frontend static files are in [../fontend](../fontend) (folder name is intentionally `fontend` in this repo).

## Conventions
- Keep controllers thin (request/response mapping), business rules in services, and SQL in DAOs.
- Service-layer errors are typically thrown as plain objects with `status` and `message`; preserve this contract when extending behavior.
- API responses generally follow `{ success, message, data }` with Vietnamese user-facing text.
- Use parameterized queries via `pool.execute(sql, params)`; avoid SQL string interpolation.
- Add input validation via Joi schemas in [../src/validation](../src/validation) and `validateRequest` from [../src/middlewares/validate.middleware.js](../src/middlewares/validate.middleware.js).

## Environment Gotchas
- Local DB defaults to `btapweb_v2` on `127.0.0.1` with `root`/no password in [../src/config/config.json](../src/config/config.json); keep this in sync with your local MySQL setup.
- Database SQL references: [../sql_v2.sql](../sql_v2.sql) (current) and [../sql.sql](../sql.sql) (older schema snapshot).
- Frontend currently calls `http://localhost:3000/api` in [../fontend/assets/js/api.js](../fontend/assets/js/api.js) and loads images from `http://localhost:8000/assets/images` in [../fontend/assets/js/image.js](../fontend/assets/js/image.js). Keep local ports aligned.
- MoMo credentials/config are currently hardcoded in [../src/services/momo.service.js](../src/services/momo.service.js) and sample data exists in [../payment.md](../payment.md). Do not add or commit new secrets.
- Many routes pass `user_id` via query/body parameters (for example, order routes) instead of centralized auth middleware. Preserve existing behavior unless the task explicitly introduces auth/authorization changes.

## References
- API request collection: [../btapweb](../btapweb)
- Payment integration sample: [../payment.md](../payment.md)
