# News Portal Backend

Backend production-ready cho website tin tức và Admin CMS, xây trên Node.js 22, Express 5, PostgreSQL (`ltree`, `unaccent`, full-text search), Redis và S3/MinIO.

## Tính năng đã triển khai

- API response/error thống nhất, request ID, Pino JSON logging, redact secret, Helmet/CSP, CORS allowlist, rate limit và Prometheus metrics.
- JWT access token + refresh token rotation lưu hash server-side; phát hiện reuse, logout một phiên/toàn bộ, forgot/reset password, Argon2id.
- RBAC `super_admin | editor | author`; Author chỉ quản lý bài của mình.
- Category tree bằng `ltree`, move/reorder, chống circular; tags merge; authors liên kết user.
- Article draft → review → scheduled/published/archived, optimistic concurrency, revision, restore, duplicate, slug history 301, preview token 15 phút.
- Public homepage aggregate không N+1, descendant category, tag/author, search tiếng Việt, trending time-decay, view dedupe/flush, RSS.
- Upload ảnh xác thực bằng Sharp, resize WebP, MinIO/S3, bảo vệ media đang được sử dụng.
- Comment mặc định qua kiểm duyệt, email/IP chỉ lưu hash, moderation/bulk action.
- Redis cache, scheduled publish distributed lock, Next.js revalidation queue có HMAC/timestamp và exponential backoff.
- Audit logs bất biến qua API, site settings không nhận secret, health live/ready, Swagger và Docker multi-stage non-root.

## Chạy local

```bash
cp .env.example .env
# Điền DATABASE_URL, POSTGRES_PASSWORD, MINIO_ROOT_USER/MINIO_ROOT_PASSWORD và toàn bộ secret bắt buộc.
docker compose up -d postgres redis minio minio-init
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

API: `http://localhost:5000/api/v1`  
Swagger: `http://localhost:5000/api/docs`  
Metrics: `http://localhost:5000/metrics`

Thay toàn bộ secret/mật khẩu trong `.env` trước khi seed. Đổi mật khẩu Super Admin ngay sau lần đăng nhập đầu. `MAIL_PROVIDER=console` chỉ trả reset token trong log/response ở development; production không giả báo gửi email khi chưa có provider.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Integration test cần PostgreSQL/Redis thật: chạy dependencies bằng Compose, migrate và smoke-test `/api/v1/health/ready`.

## Deploy production

1. Tạo network nội bộ và network Traefik `web`; PostgreSQL/Redis/MinIO không publish port Internet.
2. Tạo `.env.production` từ `.env.example` bằng secret manager/VPS secrets.
3. Dùng immutable `IMAGE_TAG=sha-...`.
4. `docker compose -f docker-compose.production.yml up migrate` trước, chỉ khi migration thành công mới cập nhật API.
5. Kiểm tra `/api/v1/health/ready`, login và publish smoke test; rollback về image SHA trước nếu lỗi.

Schema hiện dùng migration SQL idempotent và PostgreSQL advisory lock. Với thay đổi phá vỡ dữ liệu, tạo file migration forward mới và backup trước; không sửa schema production thủ công.

## Tài liệu vận hành

- [Kiến trúc và RBAC](docs/architecture/overview.md)
- [Cache invalidation](docs/architecture/cache-invalidation.md)
- [Runbook production/backup](docs/runbook-production.md)
- [OpenAPI](docs/openapi.yaml)
