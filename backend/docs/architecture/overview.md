# Backend architecture

## Luồng dữ liệu

Public API chỉ đọc bài `published`, `published_at <= now()` và category còn active. Admin mutation luôn đi qua JWT, RBAC, validation và transaction. Article mutation ghi revision/audit, invalidates Redis, rồi enqueue revalidation; lỗi webhook không rollback bài đã publish.

PostgreSQL là nguồn dữ liệu chuẩn. Redis chỉ giữ cache, view counter, dedupe và distributed lock; mất Redis không làm mất nội dung. MinIO/S3 giữ object ảnh, PostgreSQL giữ metadata/reference.

## RBAC

| Nghiệp vụ | Author | Editor | Super Admin |
|---|---:|---:|---:|
| Tạo/sửa/xóa draft của mình | Có | Có | Có |
| Gửi duyệt | Có | Có | Có |
| Publish/schedule/reject/archive | Không | Có | Có |
| Category/tag/author/media/comment | Không | Có | Có |
| User/role/settings/audit | Không | Không | Có |

Backend kiểm tra ownership qua `created_by` hoặc author đã liên kết với user; UI ẩn nút không được coi là authorization.

## Route map

- System: `/api/v1/health/live`, `/ready`, `/version`, `/api/docs`, `/metrics`.
- Auth: `/api/v1/auth/*`.
- Public: menu, homepage, categories, articles/views/trending/comments, tags, authors, search, RSS.
- CMS: `/api/v1/admin/{dashboard,articles,categories,tags,authors,media,comments,users,audit-logs,settings}`.

## Migration

`scripts/migrate.js` giữ PostgreSQL advisory transaction lock và chạy schema idempotent. Release job chạy một lần trước replica API. Trước migration phá vỡ: snapshot database, thử trên staging copy, viết forward migration và script khôi phục dữ liệu; rollback ứng dụng dùng image SHA trước.
