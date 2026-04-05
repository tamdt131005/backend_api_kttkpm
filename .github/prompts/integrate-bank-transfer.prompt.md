---
name: integrate-bank-transfer
description: "Read this Node.js layered codebase and integrate bank-transfer payment into checkout and order flow."
argument-hint: "Specific requirement (example: VietQR data, transfer reference rule, callback/manual confirmation)"
agent: agent
---
Integrate bank-transfer payment into this repository.

Use the user request that invokes this prompt as the functional requirement.

Context to inspect first:
- [Order routes](../../src/routes/order.route.js)
- [Order controller](../../src/controller/order.controller.js)
- [Order service](../../src/services/order.service.js)
- [Order DAO](../../src/dao/order.dao.js)
- [Validation middleware](../../src/middlewares/validate.middleware.js)
- [Bruno order requests](../../btapweb/order)
- [Project instructions](../copilot-instructions.md)

Required workflow:
1. Read the current payment flow and summarize current behavior before editing.
2. If the requirement is ambiguous, ask up to 3 focused clarifying questions, then proceed.
3. Implement minimal safe changes that follow project architecture:
   - route -> validation -> controller -> service -> dao
   - thin controllers, business rules in service, SQL in DAO
   - use parameterized queries only (`pool.execute(sql, params)`)
   - keep API response shape `{ success, message, data }`
   - keep service errors as plain objects `{ status, message }`
4. Preserve existing payment methods and avoid regressions.
5. Add or update Bruno requests for new/changed endpoints under `btapweb/order`.
6. Do not add hardcoded secrets. Use config/env placeholders if needed.

Deliverables:
- Code changes with file-by-file explanation.
- Validation/test checklist (how to call endpoints and expected results).
- Risks and assumptions.
- Optional next steps if remaining work exists.