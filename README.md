# News Portal Frontend

Frontend tin tức sử dụng Next.js App Router, TypeScript và Tailwind CSS.

## Chạy local

Yêu cầu Node.js 20.9 trở lên.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Biến môi trường

```env
API_URL=http://localhost:5000
REVALIDATE_SECRET=replace-with-a-long-random-secret-token
```

- `API_URL`: URL Backend Express, không đưa ra phía trình duyệt.
- `REVALIDATE_SECRET`: chuỗi bí mật tối thiểu 32 ký tự. Backend và Frontend phải dùng cùng giá trị.

## On-demand revalidation

Backend gọi Route Handler sau khi publish hoặc cập nhật nội dung:

```http
POST /api/revalidate
Content-Type: application/json

{
  "tag": "article:slug-bai-viet",
  "secret_token": "your-revalidation-secret"
}
```

Các tag hợp lệ:

- `homepage`
- `menu`
- `category:<slug>`
- `article:<slug>`

Secret được xác thực bằng phép so sánh constant-time trước khi tag được kiểm tra
và trước khi `revalidateTag()` được gọi.

## Cache strategy

| Dữ liệu | Thời gian ISR | Tag |
| --- | ---: | --- |
| Menu | 3600 giây | `menu` |
| Trang chủ | 60 giây | `homepage` |
| Danh mục | 120 giây | `category:<slug>` |
| Bài viết | 300 giây | `article:<slug>` |

## Kiểm tra trước khi deploy

```bash
npm run typecheck
npm run lint
npm run build
```
