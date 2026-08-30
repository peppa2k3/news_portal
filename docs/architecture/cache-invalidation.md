# Cache invalidation matrix

| Sự kiện backend | Cache tag/path cần làm mới |
|---|---|
| Publish bài mới | `article:<slug>`, `homepage`, `trending`, `category:<slug>`, `author:<slug>`, mọi `tag:<slug>`, `rss`, `sitemap`; path bài và trang chủ |
| Sửa bài published | Như publish; thêm category/tag/author cũ nếu quan hệ thay đổi |
| Đổi slug | Tag/path slug cũ và mới, `sitemap`, `rss`; backend trả redirect 301 cho slug cũ |
| Archive/unpublish | Article, homepage, trending, category, author, tag, RSS và sitemap liên quan |
| Move/rename category | `menu`, `homepage`, category cũ/mới và toàn bộ ancestor liên quan |
| Sửa author/tag | Tag tương ứng và các article public liên quan |
| Duyệt bình luận | `article:<slug>` chỉ khi count/HTML cache chứa dữ liệu liên quan; danh sách bình luận luôn dynamic |

Public fetch dùng TTL fallback: menu 3600 giây, homepage/trending 60 giây, category/tag/author 120 giây, article 300 giây, sitemap 3600 giây và RSS 300 giây.

Admin và search không dùng shared cache. Backend gửi webhook HMAC có timestamp; lỗi webhook không rollback publish và phải được retry bằng background job.
