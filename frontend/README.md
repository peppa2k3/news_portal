# News Portal Frontend

Frontend production cho website tin tức và Admin CMS, xây dựng bằng Next.js App Router, TypeScript, Tailwind CSS, React Hook Form, Zod và TanStack Query.

## Chức năng

- Website public: homepage, category, article, tag, author, search và các trang thông tin.
- SEO: metadata động, canonical, Open Graph, Twitter Card, NewsArticle JSON-LD, sitemap, robots và RSS.
- ISR theo cache tag; view/comment được tải riêng để không biến trang bài viết thành dynamic.
- Admin CMS: auth, dashboard, article workflow, category tree, tag, author, media, comment, users/RBAC, audit log và settings.
- BFF proxy cùng origin cho Admin, giữ cookie HttpOnly và không đưa `API_URL` ra browser.
- Revalidation HMAC SHA-256 có timestamp, giới hạn tag/path và payload.
- Docker multi-stage, standalone output, non-root runtime và healthcheck.

## Yêu cầu

- Node.js 22 LTS.
- Backend production API tuân thủ prefix `/api/v1` và response envelope trong master prompt.

## Chạy local

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Frontend: `http://localhost:3000`. Admin: `http://localhost:3000/admin`.

## Biến môi trường

| Biến | Phạm vi | Bắt buộc | Mô tả |
|---|---|---:|---|
| `API_URL` | server-only | Có | URL backend gồm `/api/v1` |
| `REVALIDATE_SECRET` | server-only | Có | Secret ngẫu nhiên tối thiểu 32 ký tự |
| `REVALIDATE_MAX_AGE_SECONDS` | server-only | Không | Cửa sổ timestamp, mặc định 300 giây |
| `NEXT_PUBLIC_SITE_URL` | public | Có | Origin canonical của website |
| `NEXT_PUBLIC_COMMENTS_ENABLED` | public | Không | Bật giao diện bình luận |
| `NEXT_PUBLIC_SENTRY_DSN` | public | Không | Adapter theo dõi lỗi nếu triển khai |

Không đưa secret vào biến có prefix `NEXT_PUBLIC_` và không commit `.env*`.

## Revalidation từ backend

Body JSON mẫu:

```json
{
  "tags": ["article:slug-bai-viet", "homepage", "rss", "sitemap"],
  "paths": ["/tin-tuc/slug-bai-viet", "/rss.xml", "/sitemap.xml"]
}
```

Backend tạo timestamp millisecond và chữ ký:

```text
signature = HMAC_SHA256(REVALIDATE_SECRET, `${timestamp}.${rawJsonBody}`)
```

Gửi qua header `x-revalidate-timestamp` và `x-revalidate-signature`. Body ký và body gửi phải giống byte-for-byte.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm test
npm run build
docker build -t news-portal-frontend .
```

## Build và chạy Docker

```bash
docker build \
  --build-arg API_URL=http://backend:5000/api/v1 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://news.example.com \
  -t news-portal-frontend .

docker run --rm -p 3000:3000 \
  -e API_URL=http://backend:5000/api/v1 \
  -e REVALIDATE_SECRET=replace-with-a-real-long-random-secret \
  -e NEXT_PUBLIC_SITE_URL=https://news.example.com \
  news-portal-frontend
```

`API_URL` cũng phải được truyền lúc runtime vì Server Components và Admin proxy gọi backend sau khi container khởi động.
