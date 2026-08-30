# Frontend data-fetching matrix

| Khu vực | Cách tải | Cache |
|---|---|---|
| Public homepage/menu/list/detail | Server Components gọi trực tiếp `API_URL` | ISR + cache tags |
| Search | Server Component theo query | `no-store` |
| View counter/comments | Client gọi BFF proxy | dynamic, không shared cache |
| Admin CMS | TanStack Query gọi BFF proxy | client cache ngắn, mutation invalidate query |
| Auth | Cookie HttpOnly do backend phát, proxy chuyển tiếp `Set-Cookie` | không cache |

Browser không biết `API_URL`; tất cả request CMS đi qua `/api/backend/*`. Proxy chỉ gọi origin backend cố định từ environment, cho phép method có allowlist và không forward authorization-sensitive header ngoài danh sách đã định.
