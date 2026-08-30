# TechReview Backend

Node.js 22 + Express 5 API foundation using PostgreSQL and the `pg` driver.

## Local setup

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

The migration creates the schema from Step 1 of `tech-spec.md`, enables the
PostgreSQL `ltree` extension, and installs triggers for category paths and
article full-text search.

Health check: `GET http://localhost:5000/api/v1/health`

The database account must be permitted to run `CREATE EXTENSION ltree`.

## Category module

```text
src/
├── controllers/
│   ├── admin/category.controller.js
│   └── category.controller.js
├── models/category.model.js
├── routes/
│   ├── admin/category.routes.js
│   └── category.routes.js
└── services/category.service.js
```

Endpoints:

- `GET /api/menu`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

The admin routes are ready for the JWT authorization middleware from the future
auth module. Do not expose them publicly in production before that middleware is
attached.
