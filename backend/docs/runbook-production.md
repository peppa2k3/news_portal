# Production runbook

## Release

1. Build image từ lockfile và tag `sha-<commit>`; scan dependency/image.
2. Backup PostgreSQL và xác nhận file backup đọc được.
3. Chạy migration container duy nhất; không để replica tự migrate.
4. Update API, chờ readiness, smoke login → create draft → publish → public article.
5. Nếu fail, quay lại image SHA trước; không rollback schema phá hủy dữ liệu bằng tay.

## Backup/restore

Backup hằng ngày bằng `pg_dump -Fc`, mã hóa và đẩy sang storage khác VPS; giữ 7 daily, 4 weekly, 6 monthly. Bật versioning/lifecycle cho media bucket.

```bash
pg_dump "$DATABASE_URL" --format=custom --file=news-portal.dump
createdb news_portal_restore_test
pg_restore --exit-on-error --clean --if-exists --dbname=news_portal_restore_test news-portal.dump
```

Restore-test tối thiểu mỗi tháng trên database tách biệt, sau đó chạy migration + smoke API và ghi lại thời gian/RPO/RTO thực tế.

## Alert tối thiểu

- Readiness/API 5xx hoặc p95 tăng cao.
- PostgreSQL/Redis connection errors, revalidation job chạm 8 attempts.
- Scheduled publish không tick, disk > 80%, certificate gần hết hạn.
- Backup hoặc restore-test thất bại.

Log không được chứa Authorization, cookie, password, raw email/IP/token. Metrics nên chỉ mở trong network monitoring hoặc được reverse proxy bảo vệ.
